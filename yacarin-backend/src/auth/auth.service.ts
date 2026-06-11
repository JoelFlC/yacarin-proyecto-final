import { Injectable, UnauthorizedException, BadRequestException, InternalServerErrorException }
    from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { UsuariosService } from '../usuarios/usuarios.service';
import { MailService } from '../mail/mail.service';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { Cliente } from '../clientes/entities/cliente.entity';
import { Administrador } from '../administradores/entities/administradore.entity';
import { Empleado } from '../empleados/entities/empleado.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
    // ÚNICO CONSTRUCTOR: Aquí inyectamos todas las dependencias necesarias
    constructor(
        private readonly usuariosService: UsuariosService,
        private readonly jwtService: JwtService,
        private readonly dataSource: DataSource,
        private readonly mailService: MailService,
    ) { }

    async login(loginDto: LoginDto) {
        // 1. Buscamos al usuario por su correo
        const usuario = await this.usuariosService.findOneByEmail(loginDto.email);

        // 2. Si no existe, lanzamos error 401 (No Autorizado)
        if (!usuario) {
            throw new UnauthorizedException('Credenciales incorrectas');
        }

        // 3. Comparamos la contraseña enviada con el Hash de la base de datos
        const isPasswordValid = await bcrypt.compare(loginDto.password, usuario.password_hash);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Credenciales incorrectas');
        }

        // Determinar el rol del usuario verificando en qué tablas existe
        let rol = 'CLIENTE';

        const esAdmin = await this.dataSource.getRepository(Administrador).findOne({ where: { usuario_id: usuario.id } });
        if (esAdmin) {
            rol = 'ADMINISTRADOR';
        } else {
            const esEmpleado = await this.dataSource.getRepository(Empleado).findOne({ where: { usuario_id: usuario.id } });
            if (esEmpleado) {
                rol = 'EMPLEADO';
            }
        }

        // 4. Si todo es correcto, preparamos la información que viajará dentro del Token (Payload)
        const payload = { sub: usuario.id, email: usuario.email, rol };

        // 5. Devolvemos el Token firmado y datos adicionales útiles
        return {
            access_token: this.jwtService.sign(payload),
            rol,
            usuario_id: usuario.id
        };
    }

    async registrarCliente(registerDto: RegisterDto) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // 1. Verificar si el correo ya existe
            const usuarioExistente = await queryRunner.manager.findOne(Usuario, {
                where: { email: registerDto.email },
            });

            if (usuarioExistente) {
                throw new BadRequestException('El correo electrónico ya está registrado.');
            }

            // 2. Encriptar contraseña
            const salt = await bcrypt.genSalt();
            const passwordHash = await bcrypt.hash(registerDto.password, salt);

            // 3. Crear el Usuario Base
            const nuevoUsuario = queryRunner.manager.create(Usuario, {
                email: registerDto.email,
                password_hash: passwordHash,
                nombre: registerDto.nombre,
                apPat: registerDto.apPat,
                apMat: registerDto.apMat,
                celular: registerDto.celular,
                activo: true,
            });
            const usuarioGuardado = await queryRunner.manager.save(nuevoUsuario);

            // 4. Crear su perfil específico de CLIENTE (Por defecto B2C / Minorista)
            const nuevoCliente = queryRunner.manager.create(Cliente, {
                usuario_id: usuarioGuardado.id, // Relación 1:1 estricta
                tipo_cliente: 'MINORISTA',
                puntos_fidelidad: 0,
            });
            await queryRunner.manager.save(nuevoCliente);

            // 5. Consolidar la transacción en la BD
            await queryRunner.commitTransaction();

            // 6. Enviar correo de bienvenida (Proceso asíncrono en segundo plano)
            this.mailService.enviarCorreoBienvenida(usuarioGuardado.email, usuarioGuardado.nombre);

            // 7. Retornar mensaje de éxito
            return {
                message: 'Registro completado exitosamente',
                usuarioId: usuarioGuardado.id,
            };

        } catch (error) {
            await queryRunner.rollbackTransaction();
            if (error instanceof BadRequestException) throw error;
            throw new InternalServerErrorException('Error al registrar el cliente');
        } finally {
            await queryRunner.release();
        }
    }

    async solicitarRecuperacion(email: string) {
        const usuario = await this.dataSource.getRepository(Usuario).findOne({ where: { email } });

        // Por seguridad, si el correo no existe, no lanzamos error, devolvemos éxito silencioso 
        // para evitar que atacantes descubran qué correos están registrados.
        if (!usuario) {
            return { message: 'Si el correo existe, se han enviado las instrucciones.' };
        }

        // Generar código numérico aleatorio de 6 dígitos
        const token = Math.floor(100000 + Math.random() * 900000).toString();

        // Configurar expiración a 15 minutos desde ahora
        const expiracion = new Date();
        expiracion.setMinutes(expiracion.getMinutes() + 15);

        // Guardar en la base de datos
        usuario.reset_password_token = token;
        usuario.reset_password_expires = expiracion;
        await this.dataSource.getRepository(Usuario).save(usuario);

        // Enviar el correo
        await this.mailService.enviarCorreoRecuperacion(usuario.email, token);

        return { message: 'Si el correo existe, se han enviado las instrucciones.' };
    }

    async restablecerPassword(email: string, token: string, nuevaPassword: string) {
        const usuario = await this.dataSource.getRepository(Usuario).findOne({ where: { email } });

        if (!usuario || usuario.reset_password_token !== token) {
            throw new BadRequestException('El código de recuperación es inválido.');
        }

        if (new Date() > usuario.reset_password_expires) {
            throw new BadRequestException('El código de recuperación ha expirado. Solicita uno nuevo.');
        }

        // Encriptar la nueva contraseña
        const salt = await bcrypt.genSalt();
        usuario.password_hash = await bcrypt.hash(nuevaPassword, salt);

        // Limpiar los tokens de recuperación para que no se puedan reusar
        usuario.reset_password_token = '';
        usuario.reset_password_expires = new Date(0);

        await this.dataSource.getRepository(Usuario).save(usuario);

        return { message: 'Contraseña actualizada exitosamente. Ya puedes iniciar sesión.' };
    }
}