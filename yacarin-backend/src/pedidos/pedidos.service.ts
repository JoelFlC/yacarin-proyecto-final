import { Injectable, BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { DataSource } from 'typeorm';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { Pedido } from './entities/pedido.entity';
import { DetallePedido } from './entities/detalle-pedido.entity';
import { Producto } from '../productos/entities/producto.entity';
import { TipoCambio } from 'src/tipo-cambio/entities/tipo-cambio.entity';

@Injectable()
export class PedidosService {
  // Inyectamos el DataSource en lugar de repositorios individuales para manejar la transacción global
  constructor(private dataSource: DataSource) {}

  async create(clienteId: string, createPedidoDto: CreatePedidoDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    
    // Iniciamos la burbuja transaccional
    await queryRunner.startTransaction();

    try {
      let totalUsd = 0;
      const detallesToSave: DetallePedido[] = [];

      // 1. Crear la cabecera del pedido temporalmente
      const pedido = queryRunner.manager.create(Pedido, {
        cliente: { id: clienteId },
        direccion_envio: createPedidoDto.direccion_envio,
        estado: 'PENDIENTE',
        total_usd: 0, // Lo calcularemos iterando los ítems
      });
      const savedPedido = await queryRunner.manager.save(pedido);

      // 2. Procesar el "carrito de compras"
      for (const item of createPedidoDto.items) {
        
        // Buscamos el producto y bloqueamos la fila (pessimistic_write) para que nadie más lo toque
        const producto = await queryRunner.manager.findOne(Producto, {
          where: { id: item.producto_id },
          lock: { mode: 'pessimistic_write' }, 
        });

        if (!producto) {
          throw new BadRequestException(`El producto físico con ID ${item.producto_id} no existe.`);
        }

        if (producto.stock_actual < item.cantidad) {
          throw new BadRequestException(`Stock insuficiente para el producto: ${producto.nombre_comercial}`);
        }

        // 3. Descontamos el stock físico
        producto.stock_actual -= item.cantidad;
        await queryRunner.manager.save(producto);

        // 4. Calculamos subtotal
        totalUsd += (producto.precio_base_usd * item.cantidad);

        // 5. Preparamos el registro del detalle
        const detalle = queryRunner.manager.create(DetallePedido, {
          pedido: savedPedido,
          producto: producto,
          cantidad: item.cantidad,
          precio_unitario_usd: producto.precio_base_usd,
        });
        detallesToSave.push(detalle);
      }

      // 6. Guardamos todos los detalles de golpe y actualizamos el total del pedido
      await queryRunner.manager.save(detallesToSave);
      savedPedido.total_usd = totalUsd;
      await queryRunner.manager.save(savedPedido);

      // 7. Si llegamos aquí sin errores, guardamos todo permanentemente (Commit)
      await queryRunner.commitTransaction();
      return savedPedido;

    } catch (error) {
      // 8. Si ALGO falla (falta de stock, error de BD), revertimos todo a cero (Rollback)
      await queryRunner.rollbackTransaction();
      throw error instanceof BadRequestException ? error : new InternalServerErrorException('Error crítico al procesar el pedido.');
    } finally {
      // 9. Cerramos la conexión para no saturar el servidor
      await queryRunner.release();
    }
  }


  // Importa esto en la parte superior del archivo:
  // import * as PDFDocument from 'pdfkit';
  // import { NotFoundException } from '@nestjs/common';

  async generarComprobantePdf(pedidoId: string): Promise<Buffer> {
    // 1. Buscamos el pedido con sus relaciones existentes
    const pedido = await this.dataSource.getRepository(Pedido).findOne({
      where: { id: pedidoId },
      relations: {
        cliente: true,
        detalles: {
          producto: true
        }
      }
    });

    if (!pedido) {
      throw new NotFoundException('Pedido no encontrado para generar comprobante.');
    }

    // CONVERSIÓN EN TIEMPO REAL: Buscamos el valor del dólar usando el dataSource directo
    // Esto evita tocar el constructor o alterar las dependencias del módulo
    let tasaDolar = 6.96;
    try {
      const tasaRecord = await this.dataSource.getRepository(TipoCambio).findOneBy({ moneda: 'USD' });
      if (tasaRecord) {
        tasaDolar = Number(tasaRecord.valor_bs);
      }
    } catch (error) {
      console.warn('Alerta: No se pudo obtener la tasa en vivo, usando 6.96 por defecto');
    }

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const buffers: Buffer[] = [];

      doc.on('data', (buffer) => buffers.push(buffer));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // --- DISEÑO DEL PDF ---
      doc.fontSize(20).font('Helvetica-Bold').text('YACARÍN', { align: 'center' });
      doc.fontSize(10).font('Helvetica').text('Ropa para bebés - Cariño que abraza', { align: 'center' });
      doc.moveDown();
      doc.text(`Comprobante de Venta: ${pedido.id.split('-')[0].toUpperCase()}`, { align: 'right' });
      doc.text(`Fecha: ${new Date(pedido.fecha_pedido).toLocaleDateString()}`, { align: 'right' });
      doc.moveDown();

      // Datos del Cliente
      doc.fontSize(12).font('Helvetica-Bold').text('Datos del Cliente:');
      doc.font('Helvetica').fontSize(10);
      doc.text(`Nombre: ${pedido.cliente.nombre} ${pedido.cliente.apPat} ${pedido.cliente.apMat}`);    
      doc.text(`Email: ${pedido.cliente.email}`);
      doc.text(`Dirección de envío: ${pedido.direccion_envio || 'Recojo en tienda'}`);
      doc.moveDown();

      // Tabla de Detalles (Cabecera adaptada para mostrar ambas conversiones)
      doc.font('Helvetica-Bold');
      doc.text('Producto', 50, doc.y, { continued: true, width: 220 });
      doc.text('Cant.', 270, doc.y, { continued: true, width: 40 });
      doc.text('P. Unit (USD)', 310, doc.y, { continued: true, width: 80 });
      doc.text('Subtotal (USD)', 390, doc.y, { continued: true, width: 80 });
      doc.text('Subtotal (BS)', 470, doc.y);
      doc.moveTo(50, doc.y + 5).lineTo(550, doc.y + 5).stroke();
      doc.moveDown();

      // Tabla de Detalles (Filas calculadas al vuelo)
      doc.font('Helvetica');
      pedido.detalles.forEach((detalle) => {
        const subtotalUsd = detalle.cantidad * Number(detalle.precio_unitario_usd);
        const subtotalBs = subtotalUsd * tasaDolar; // Conversión dinámica utilizando el valor del dólar

        doc.text(`${detalle.producto.nombre_comercial} (Talla: ${detalle.producto.talla})`, 50, doc.y, { continued: true, width: 220 });
        doc.text(`${detalle.cantidad}`, 270, doc.y, { continued: true, width: 40 });
        doc.text(`$${Number(detalle.precio_unitario_usd).toFixed(2)}`, 310, doc.y, { continued: true, width: 80 });
        doc.text(`$${subtotalUsd.toFixed(2)}`, 390, doc.y, { continued: true, width: 80 });
        doc.text(`Bs. ${subtotalBs.toFixed(2)}`, 470, doc.y);
      });

      doc.moveDown(2);
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown();

      // Totales Finales Convertidos
      const totalUSD = Number(pedido.total_usd);
      const totalBS = totalUSD * tasaDolar;

      doc.fontSize(12).font('Helvetica-Bold').text(`TOTAL USD: $${totalUSD.toFixed(2)} USD`, { align: 'right' });
      doc.fontSize(12).font('Helvetica-Bold').text(`TOTAL BOLIVIANOS: Bs. ${totalBS.toFixed(2)} BS`, { align: 'right' });
      
      doc.moveDown(0.5);
      doc.fontSize(9).font('Helvetica-Oblique').text(`Tipo de cambio utilizado: 1 USD = ${tasaDolar.toFixed(2)} Bs.`, { align: 'right' });

      doc.moveDown(2);
      doc.fontSize(10).font('Helvetica-Oblique').text('Gracias por su preferencia. Documento sin valor fiscal legal.', { align: 'center' });

      doc.end();
    });
  }
}