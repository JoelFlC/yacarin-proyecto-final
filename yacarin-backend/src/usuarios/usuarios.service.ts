import { Injectable, BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { CreateEmpleadoDto } from '../empleados/dto/create-empleado.dto';
import { Usuario } from './entities/usuario.entity';
import { Empleado } from '../empleados/entities/empleado.entity';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    
    private readonly dataSource: DataSource,
  ) {}


  async create(createUsuarioDto: CreateUsuarioDto) {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(createUsuarioDto.password, saltRounds);

    const nuevoUsuario = this.usuarioRepository.create({
      email: createUsuarioDto.email,
      password_hash: hashedPassword,
      nombre: createUsuarioDto.nombre,
      apPat: createUsuarioDto.apPat,
      apMat: createUsuarioDto.apMat,
      celular: createUsuarioDto.celular,
      activo: true, // Nace activo por defecto
    });

    return await this.usuarioRepository.save(nuevoUsuario);
  }


  async crearEmpleado(createEmpleadoDto: CreateEmpleadoDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const usuarioExistente = await queryRunner.manager.findOne(Usuario, {
        where: { email: createEmpleadoDto.email },
      });

      if (usuarioExistente) {
        throw new BadRequestException('El correo ya está registrado en el sistema.');
      }


      const salt = await bcrypt.genSalt();
      const passwordHash = await bcrypt.hash(createEmpleadoDto.password, salt);


      const nuevoUsuario = queryRunner.manager.create(Usuario, {
        email: createEmpleadoDto.email,
        password_hash: passwordHash,
        nombre: createEmpleadoDto.nombre,
        apPat: createEmpleadoDto.apPat,
        apMat: createEmpleadoDto.apMat,
        celular: createEmpleadoDto.celular,
        activo: true,
      });
      const usuarioGuardado = await queryRunner.manager.save(nuevoUsuario);

  
      const nuevoEmpleado = queryRunner.manager.create(Empleado, {

        usuario: usuarioGuardado, 
        especialidades: {
          corte: false,
          costura: true, 
          empaque: false,
          tejeduria: false
        },
      });
      await queryRunner.manager.save(nuevoEmpleado);

      // Si todo sale bien, consolidamos los cambios
      await queryRunner.commitTransaction();

      return {
        message: 'Empleado registrado exitosamente',
        usuarioId: usuarioGuardado.id,
      };

    } catch (error) {
      // Si algo falla, revertimos todo para evitar datos huérfanos
      await queryRunner.rollbackTransaction();
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Error al registrar al empleado');
    } finally {
      // Liberamos el hilo de conexión de la BD
      await queryRunner.release();
    }
  }

  // Retorna solo los usuarios que no han sido eliminados lógicamente
  findAll() {
    return this.usuarioRepository.find({
      where: { activo: true }
    });
  }

  findOneByEmail(email: string) {
    return this.usuarioRepository.findOneBy({ email, activo: true });
  }

  async findOne(id: string) {
    const usuario = await this.usuarioRepository.findOneBy({ id, activo: true });
    if (!usuario) throw new NotFoundException(`Usuario con ID ${id} no encontrado o inactivo.`);
    return usuario;
  }

  async update(id: string, updateUsuarioDto: UpdateUsuarioDto) {
    // 1. Buscamos al usuario ignorando su estado (solo por ID) para permitir la reactivación
    const usuario = await this.usuarioRepository.findOne({ 
      where: { id } 
    });

    // Si de verdad no existe en la base de datos, lanzamos error
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no existe en la base de datos.`);
    }

    // 2. Fusionamos los nuevos datos (por ejemplo, activo: true)
    const usuarioActualizado = this.usuarioRepository.merge(usuario, updateUsuarioDto);
    
    // 3. Guardamos los cambios
    return await this.usuarioRepository.save(usuarioActualizado);
  }

  // Criterio de Evaluación Académica: ELIMINACIÓN LÓGICA
  async remove(id: string) {
    const usuario = await this.usuarioRepository.findOneBy({ id });
    if (!usuario) throw new NotFoundException('El usuario no existe.');

    usuario.activo = false; // Cambiamos el estado en lugar de usar un DELETE físico
    await this.usuarioRepository.save(usuario);
    
    return { 
      message: 'Usuario eliminado lógicamente con éxito. Los registros históricos se mantienen intactos.' 
    };
  }
}