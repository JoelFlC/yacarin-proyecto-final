import { Injectable, BadRequestException, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CreatePagoDto } from './dto/create-pago.dto';
import { Pago } from './entities/pago.entity';
import { Pedido } from '../pedidos/entities/pedido.entity';
import { TipoCambio } from '../tipo-cambio/entities/tipo-cambio.entity';
import { PedidosService } from '../pedidos/pedidos.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class PagoService {
  constructor(
    private dataSource: DataSource,
    @Inject(forwardRef(() => PedidosService))
    private pedidosService: PedidosService,
    private mailService: MailService
  ) {}

  async create(dto: CreatePagoDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const tipoCambio = await queryRunner.manager.findOne(TipoCambio, { where: { moneda: 'USD' } });
      if (!tipoCambio) throw new BadRequestException('Tipo de cambio USD no configurado.');

      const pedido = await queryRunner.manager.findOne(Pedido, { where: { id: dto.pedido_id } });
      if (!pedido) throw new NotFoundException('Pedido no encontrado');

      const monto_bs = dto.monto_pagado_usd * Number(tipoCambio.valor_bs);

      const pago = queryRunner.manager.create(Pago, {
        pedido: { id: dto.pedido_id },
        tipo_cambio: { id: tipoCambio.id },
        monto_pagado_usd: dto.monto_pagado_usd,
        monto_pagado_bs: monto_bs,
        metodo_pago: dto.metodo_pago,
        tipo_pago: dto.tipo_pago,
        concepto: dto.concepto || '',
        estado_validacion: 'PENDIENTE'
      });

      await queryRunner.manager.save(pago);
      await queryRunner.commitTransaction();
      return pago;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll() {
    return this.dataSource.getRepository(Pago).find({
      relations: { pedido: { cliente: true }, tipo_cambio: true },
      order: { fecha_pago: 'DESC' }
    });
  }

  async findByPedido(pedidoId: string) {
    return this.dataSource.getRepository(Pago).find({
      where: { pedido: { id: pedidoId } },
      relations: { tipo_cambio: true },
      order: { fecha_pago: 'DESC' }
    });
  }

  async aprobarPago(id: string) {
    const pago = await this.dataSource.getRepository(Pago).findOne({ 
      where: { id },
      relations: { pedido: { cliente: true } }
    });
    if (!pago) throw new NotFoundException('Pago no encontrado');
    if (pago.estado_validacion === 'APROBADO') throw new BadRequestException('El pago ya está aprobado');

    pago.estado_validacion = 'APROBADO';
    await this.dataSource.getRepository(Pago).save(pago);

    // Cambiar el estado del pedido si corresponde
    if (pago.pedido.estado === 'PENDIENTE') {
      pago.pedido.estado = 'PAGADO'; // o EN_PROCESO
      await this.dataSource.getRepository(Pedido).save(pago.pedido);
    }

    // Generar PDF del recibo del pedido y enviarlo por correo
    const bufferPdf = await this.pedidosService.generarComprobantePdf(pago.pedido.id);
    await this.mailService.enviarReciboPago(pago.pedido.cliente.email, bufferPdf, pago.pedido.id);

    return pago;
  }
}
