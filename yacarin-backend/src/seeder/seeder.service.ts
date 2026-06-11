import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

import { TipoCambio } from '../tipo-cambio/entities/tipo-cambio.entity';
import { Administrador } from '../administradores/entities/administradore.entity';
import { Cliente } from '../clientes/entities/cliente.entity';
import { Empleado } from '../empleados/entities/empleado.entity';
import { Proveedor } from '../proveedores/entities/proveedore.entity';
import { Material } from '../materiales/entities/materiale.entity';
import { Diseno } from '../disenos/entities/diseno.entity';
import { Producto } from '../productos/entities/producto.entity';
import { RecetaMaterial } from '../receta-material/entities/receta-material.entity';
import { DireccionEnvio } from '../direccion-envio/entities/direccion-envio.entity';
import { Pedido } from '../pedidos/entities/pedido.entity';
import { DetallePedido } from '../pedidos/entities/detalle-pedido.entity';
import { OrdenProduccion } from '../orden-produccion/entities/orden-produccion.entity';
import { TarifaProduccion } from '../tarifas/entities/tarifa.entity';
import { RegistroProduccion } from '../registro-produccion/entities/registro-produccion.entity';

@Injectable()
export class SeederService {
  private readonly logger = new Logger(SeederService.name);

  constructor(private readonly dataSource: DataSource) {}

  async seed() {
    this.logger.log('Iniciando poblamiento de la base de datos...');
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Tipo de Cambio
      const tipoCambioRepo = queryRunner.manager.getRepository(TipoCambio);
      const tcExistente = await tipoCambioRepo.findOne({ where: { moneda: 'USD' } });
      let tcId: number;
      if (!tcExistente) {
        const nuevoTc = tipoCambioRepo.create({ moneda: 'USD', valor_bs: 6.96 as any });
        await tipoCambioRepo.save(nuevoTc);
        tcId = nuevoTc.id;
        this.logger.log('Tipo de Cambio creado.');
      } else {
        tcId = tcExistente.id;
      }

      // 2. Usuarios (Admin y Clientes)
      const usuarioRepo = queryRunner.manager.getRepository('USUARIO');
      const adminRepo = queryRunner.manager.getRepository(Administrador);
      const clienteRepo = queryRunner.manager.getRepository(Cliente);
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const clientPassword = await bcrypt.hash('cliente123', 10);

      const adminExistente = await usuarioRepo.findOne({ where: { email: 'admin@yacarin.com' } });
      if (!adminExistente) {
        const u = await usuarioRepo.save(usuarioRepo.create({
          id: randomUUID(),
          email: 'admin@yacarin.com',
          password_hash: hashedPassword,
          nombre: 'Joel',
          apPat: 'Flores',
          apMat: 'Admin',
          celular: '1234567'
        }));
        await adminRepo.save(adminRepo.create({
          usuario_id: u.id
        }));
        this.logger.log('Administrador creado.');
      }

      let userMinorista = await usuarioRepo.findOne({ where: { email: 'juan@cliente.com' } });
      if (!userMinorista) {
        userMinorista = await usuarioRepo.save(usuarioRepo.create({
          id: randomUUID(),
          email: 'juan@cliente.com',
          password_hash: clientPassword,
          nombre: 'Juan',
          apPat: 'Pérez',
          apMat: 'López',
          celular: '77712345'
        }));
        await clienteRepo.save(clienteRepo.create({
          usuario_id: userMinorista.id,
          tipo_cliente: 'B2C'
        }));
      }

      let userMayorista = await usuarioRepo.findOne({ where: { email: 'empresa@cliente.com' } });
      if (!userMayorista) {
        userMayorista = await usuarioRepo.save(usuarioRepo.create({
          id: randomUUID(),
          email: 'empresa@cliente.com',
          password_hash: clientPassword,
          nombre: 'Baby Store',
          apPat: 'SRL',
          apMat: '',
          celular: '66612345'
        }));
        await clienteRepo.save(clienteRepo.create({
          usuario_id: userMayorista.id,
          tipo_cliente: 'B2B',
          nit: '1234567015',
          razon_social: 'Baby Store SRL'
        }));
      }

      // Empleado (Costurera)
      const empleadoRepo = queryRunner.manager.getRepository(Empleado);
      let userEmpleado = await usuarioRepo.findOne({ where: { email: 'maria@costura.com' } });
      if (!userEmpleado) {
        userEmpleado = await usuarioRepo.save(usuarioRepo.create({
          id: randomUUID(),
          email: 'maria@costura.com',
          password_hash: clientPassword, // usamos la misma pass
          nombre: 'Maria',
          apPat: 'Costurera',
          apMat: 'Gomez',
          celular: '77766655'
        }));
        await empleadoRepo.save(empleadoRepo.create({
          usuario_id: userEmpleado.id,
          especialidades: {
            corte: false,
            costura: true,
            empaque: false,
            tejeduria: false
          }
        }));
      }

      this.logger.log('Clientes y Empleados creados.');

      // 3. Direcciones de envío
      const direccionRepo = queryRunner.manager.getRepository(DireccionEnvio);
      let direccion = await direccionRepo.findOne({ where: { cliente: { id: userMinorista.id } } });
      if (!direccion) {
        direccion = await direccionRepo.save(direccionRepo.create({
          cliente: { id: userMinorista.id },
          departamento: 'La Paz',
          zona: 'Sopocachi',
          calle_numero: 'Av. Ecuador 1234'
        }));
      }

      // 4. Proveedores
      const provRepo = queryRunner.manager.getRepository(Proveedor);
      const provTelas = await provRepo.save(provRepo.create({ nombre_empresa: 'Telas Andinas', telefono: '2222222' }));
      const provHilos = await provRepo.save(provRepo.create({ nombre_empresa: 'Hilos Omega', telefono: '3333333' }));
      const provBotones = await provRepo.save(provRepo.create({ nombre_empresa: 'Mercería Central', telefono: '4444444' }));
      this.logger.log('Proveedores creados.');

      // 5. Materiales
      const matRepo = queryRunner.manager.getRepository(Material);
      const telaAlgodon = await matRepo.save(matRepo.create({ nombre: 'Tela Algodón Bebé', unidad_medida: 'Metros', stock_actual: 500, costo_base_usd: 3.50 }));
      const telaPolar = await matRepo.save(matRepo.create({ nombre: 'Tela Polar', unidad_medida: 'Metros', stock_actual: 300, costo_base_usd: 2.80 }));
      const hiloBlanco = await matRepo.save(matRepo.create({ nombre: 'Hilo de Algodón Blanco', unidad_medida: 'Conos', stock_actual: 50, costo_base_usd: 1.20 }));
      const botonBroche = await matRepo.save(matRepo.create({ nombre: 'Broche a presión', unidad_medida: 'Unidades', stock_actual: 1000, costo_base_usd: 0.10 }));
      const elastico = await matRepo.save(matRepo.create({ nombre: 'Elástico Suave', unidad_medida: 'Metros', stock_actual: 200, costo_base_usd: 0.50 }));
      this.logger.log('Materiales creados.');

      // 6. Diseños
      const disenoRepo = queryRunner.manager.getRepository(Diseno);
      const disenoAjuar = await disenoRepo.save(disenoRepo.create({
        nombre_patron: 'Ajuar Capibara', 
        descripcion_tecnica: 'Colección de ajuares con temática de capibara', 
        color_primario: 'Cafe',
        color_secundario: 'Celeste'
      }));
      const disenoOsito = await disenoRepo.save(disenoRepo.create({
        nombre_patron: 'Conjunto Osito Polar', 
        descripcion_tecnica: 'Conjunto abrigador para invierno', 
        color_primario: 'Blanco',
        color_secundario: 'Celeste'
      }));
      this.logger.log('Diseños creados.');

      // 7. Productos
      const prodRepo = queryRunner.manager.getRepository(Producto);
      const prod1 = await prodRepo.save(prodRepo.create({
        diseno: { id: disenoAjuar.id },
        nombre_comercial: 'Ajuar Capibara Completo',
        talla: 'RN',
        precio_base_usd: 25.00,
        descuento_mayorista: 5.00,
        stock_actual: 50, // Ponemos stock inicial para pruebas directas
        imagen_url: 'https://res.cloudinary.com/dw5av6bz1/image/upload/v1700000000/yacarin/ajuar-capibara.png'
      }));
      const prod2 = await prodRepo.save(prodRepo.create({
        diseno: { id: disenoOsito.id },
        nombre_comercial: 'Mameluco Osito Polar',
        talla: '3M',
        precio_base_usd: 18.00,
        descuento_mayorista: 3.00,
        stock_actual: 30,
        imagen_url: 'https://res.cloudinary.com/dw5av6bz1/image/upload/v1700000000/yacarin/conjunto-osito.png'
      }));
      this.logger.log('Productos creados.');

      // 8. Recetas
      const recetaRepo = queryRunner.manager.getRepository(RecetaMaterial);
      await recetaRepo.save([
        recetaRepo.create({ producto_id: prod1.id, material_id: telaAlgodon.id, cantidad_requerida: 1.5 }),
        recetaRepo.create({ producto_id: prod1.id, material_id: hiloBlanco.id, cantidad_requerida: 0.1 }),
        recetaRepo.create({ producto_id: prod1.id, material_id: botonBroche.id, cantidad_requerida: 5 }),
        recetaRepo.create({ producto_id: prod2.id, material_id: telaPolar.id, cantidad_requerida: 1.2 }),
        recetaRepo.create({ producto_id: prod2.id, material_id: hiloBlanco.id, cantidad_requerida: 0.1 }),
        recetaRepo.create({ producto_id: prod2.id, material_id: elastico.id, cantidad_requerida: 0.5 }),
      ]);
      this.logger.log('Recetas creadas.');

      // 9. Órdenes de Producción
      const ordenProdRepo = queryRunner.manager.getRepository(OrdenProduccion);
      const orden1 = await ordenProdRepo.save(ordenProdRepo.create({
        producto: { id: prod1.id },
        cantidad_fabricar: 50,
        estado: 'COMPLETADA',
        fecha_inicio: new Date()
      }));
      this.logger.log('Órdenes de producción creadas.');

      // 9.5 Tarifas y Registro de Producción (Destajo)
      const tarifaRepo = queryRunner.manager.getRepository(TarifaProduccion);
      const registroRepo = queryRunner.manager.getRepository(RegistroProduccion);
      
      let tarifaCostura = await tarifaRepo.findOne({ where: { tarea: 'Costura Recta' } });
      if (!tarifaCostura) {
        tarifaCostura = await tarifaRepo.save(tarifaRepo.create({
          tarea: 'Costura Recta',
          precio_bs: 5.50
        }));
      }

      const registrosExistentes = await registroRepo.find({ where: { orden: { id: orden1.id } } });
      if (registrosExistentes.length === 0) {
        await registroRepo.save(registroRepo.create({
          empleado: { usuario_id: userEmpleado.id } as any,
          orden: { id: orden1.id } as any,
          tarea_realizada: tarifaCostura.tarea,
          cantidad_producida: 50,
          tarifa_unidad: 5.50,
          total_a_pagar: 275.00, // 50 * 5.50
          estado_pago: 'PENDIENTE'
        }));
        this.logger.log('Destajo registrado para empleado.');
      }

      // 10. Pedidos
      const pedidoRepo = queryRunner.manager.getRepository(Pedido);
      const detPedidoRepo = queryRunner.manager.getRepository(DetallePedido);
      const pedidoRealizado = await pedidoRepo.save(pedidoRepo.create({
        cliente: { id: userMinorista.id } as any,
        direccion: { id: direccion.id } as any,
        tipo_cambio: { id: tcId } as any,
        estado: 'PENDIENTE',
        total_usd: 43.00 as any
      }));

      await detPedidoRepo.save([
        detPedidoRepo.create({ pedido: pedidoRealizado, producto: prod1, cantidad: 1, precio_unitario_usd: 25.00 as any }),
        detPedidoRepo.create({ pedido: pedidoRealizado, producto: prod2, cantidad: 1, precio_unitario_usd: 18.00 as any }),
      ]);
      this.logger.log('Pedidos de prueba creados.');

      await queryRunner.commitTransaction();
      this.logger.log('¡Base de datos poblada exitosamente!');
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Error al poblar la base de datos:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
