import { Injectable, BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CreateOrdenProduccionDto } from './dto/create-orden-produccion.dto';
import { OrdenProduccion } from './entities/orden-produccion.entity';
import { OrdenMaterial } from './entities/orden-material.entity';
import { Material } from '../materiales/entities/materiale.entity';
import { Producto } from '../productos/entities/producto.entity';
import { RecetaMaterialService } from '../receta-material/receta-material.service';

@Injectable()
export class OrdenProduccionService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly recetaService: RecetaMaterialService,
  ) {}

  // 1. CREAR ORDEN: Calcula y descuenta insumos de bodega
  async create(createDto: CreateOrdenProduccionDto) {
    // Buscamos la fórmula secreta del producto
    const receta = await this.recetaService.findByProducto(createDto.producto_id);
    if (!receta || receta.length === 0) {
      throw new BadRequestException('No se puede fabricar este producto porque no tiene una receta base configurada.');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Crear cabecera de la orden
      const orden = queryRunner.manager.create(OrdenProduccion, {
        producto: { id: createDto.producto_id },
        cantidad_fabricar: createDto.cantidad_fabricar,
        estado: 'EN_PROCESO',
      });
      const savedOrden = await queryRunner.manager.save(orden);

      const materialesConsumidosToSave: OrdenMaterial[] = [];

      // Iteramos los ingredientes de la receta
      for (const ingrediente of receta) {
        // Bloqueamos la fila del material para evitar desfases de stock
        const material = await queryRunner.manager.findOne(Material, {
          where: { id: ingrediente.material_id },
          lock: { mode: 'pessimistic_write' },
        });

        if (!material) {
          throw new BadRequestException(`El material con ID ${ingrediente.material_id} ya no existe.`);
        }

        // Multiplicamos la cantidad de la receta por las unidades a fabricar
        const cantidadTotalConsumo = ingrediente.cantidad_requerida * createDto.cantidad_fabricar;

        if (material.stock_actual < cantidadTotalConsumo) {
          throw new BadRequestException(`Insumos insuficientes en bodega. Se requieren ${cantidadTotalConsumo} ${material.unidad_medida} de '${material.nombre}', pero solo quedan ${material.stock_actual}.`);
        }

        // Descontamos la tela/hilo de la bodega de materiales
        material.stock_actual -= cantidadTotalConsumo;
        await queryRunner.manager.save(material);

        // Registramos el detalle del consumo histórico de esta orden
        const ordenMaterial = queryRunner.manager.create(OrdenMaterial, {
          ordenProduccion: savedOrden,
          material: material,
          cantidad_consumida: cantidadTotalConsumo,
        });
        materialesConsumidosToSave.push(ordenMaterial);
      }

      await queryRunner.manager.save(materialesConsumidosToSave);
      await queryRunner.commitTransaction();
      return savedOrden;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error instanceof BadRequestException ? error : new InternalServerErrorException('Error crítico en el taller de producción.');
    } finally {
      await queryRunner.release();
    }
  }

  // 2. COMPLETAR ORDEN: Recibe la costura y suma al inventario de prendas
  async completar(id: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Usamos QueryBuilder para forzar un INNER JOIN. 
      // Esto evita el error de PostgreSQL y bloquea ambas tablas de forma segura.
      const orden = await queryRunner.manager.createQueryBuilder(OrdenProduccion, 'orden')
        .innerJoinAndSelect('orden.producto', 'producto')
        .where('orden.id = :id', { id })
        .setLock('pessimistic_write')
        .getOne();

      if (!orden) throw new NotFoundException(`La orden de producción con ID ${id} no existe.`);
      if (orden.estado !== 'EN_PROCESO') throw new BadRequestException(`Esta orden ya no se puede completar porque está: ${orden.estado}`);

      // 2. Gracias al QueryBuilder, ya tenemos el producto cargado y bloqueado en "orden.producto"
      const producto = orden.producto;

      // 3. Sumamos el stock con programación defensiva
      producto.stock_actual = Number(producto.stock_actual || 0) + Number(orden.cantidad_fabricar);
      await queryRunner.manager.save(producto);

      // 4. Cambiamos el estado de la orden
      orden.estado = 'COMPLETADA';
      const ordenActualizada = await queryRunner.manager.save(orden);

      await queryRunner.commitTransaction();
      return ordenActualizada;

    } catch (error) {
      console.error('🔥 ERROR CRÍTICO EN EL TALLER:', error);
      await queryRunner.rollbackTransaction();
      
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      // Si el error es un objeto Error, sacamos su mensaje; si no, ponemos un texto por defecto.
      const mensajeError = error instanceof Error ? error.message : 'Error desconocido';
      throw new InternalServerErrorException(`Fallo en BD: ${mensajeError}`);
    } finally {
      await queryRunner.release();
    }
  }
  // Métodos de consulta rápidos
  findAll() {
    return this.dataSource.getRepository(OrdenProduccion).find({
      relations: { producto: true, materiales_consumidos: { material: true } },
    });
  }
}