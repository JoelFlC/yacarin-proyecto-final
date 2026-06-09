import { Injectable, BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import PDFDocument from 'pdfkit';
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

  async generarReportePdf(): Promise<Buffer> {
    const ordenes = await this.dataSource.getRepository(OrdenProduccion).find({
      relations: { producto: true },
      order: { fecha_inicio: 'DESC' }
    });

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const buffers: Buffer[] = [];

      doc.on('data', (buffer) => buffers.push(buffer));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // --- DISEÑO DEL PDF ---
      doc.fontSize(20).font('Helvetica-Bold').text('YACARÍN ERP', { align: 'center' });
      doc.fontSize(10).font('Helvetica').text('Reporte de Órdenes de Producción y Destajo', { align: 'center' });
      doc.moveDown();
      doc.text(`Fecha de emisión: ${new Date().toLocaleDateString()}`, { align: 'right' });
      doc.moveDown(2);

      // Cabeceras
      doc.font('Helvetica-Bold');
      doc.text('ID Orden', 50, doc.y, { continued: true, width: 80 });
      doc.text('Producto', 140, doc.y, { continued: true, width: 180 });
      doc.text('Cantidad', 330, doc.y, { continued: true, width: 70 });
      doc.text('Estado', 410, doc.y);
      doc.moveTo(50, doc.y + 5).lineTo(550, doc.y + 5).stroke();
      doc.moveDown();

      // Filas
      doc.font('Helvetica');
      ordenes.forEach((orden) => {
        const idCorto = orden.id.substring(0, 8).toUpperCase();
        doc.text(idCorto, 50, doc.y, { continued: true, width: 80 });
        doc.text(`${orden.producto?.nombre_comercial} (Talla: ${orden.producto?.talla})`, 140, doc.y, { continued: true, width: 180 });
        doc.text(`${orden.cantidad_fabricar} und.`, 330, doc.y, { continued: true, width: 70 });
        doc.text(orden.estado, 410, doc.y);
      });

      doc.moveDown(2);
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown();
      doc.fontSize(10).font('Helvetica-Oblique').text('Documento generado automáticamente por el sistema ERP.', { align: 'center' });

      doc.end();
    });
  }
}