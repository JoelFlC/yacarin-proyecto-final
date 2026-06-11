import { Controller, Post, Body, UseGuards, Req, Get, Param, Res } from '@nestjs/common';
import type { Response } from 'express';
import { PedidosService } from './pedidos.service';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('pedidos')
export class PedidosController {
  constructor(private readonly pedidosService: PedidosService) {}

  @Post()
  create(@Req() req: any, @Body() createPedidoDto: CreatePedidoDto) {
    // El guardia decodifica el token y coloca el ID del cliente logueado en req.user.id
    const clienteId = req.user.id; 
    return this.pedidosService.create(clienteId, createPedidoDto);
  }

  @Get()
  findAll() {
    return this.pedidosService.findAll();
  }

  @Get(':id/comprobante')
  async descargarComprobante(@Param('id') id: string, @Res() res: Response) {
    const buffer = await this.pedidosService.generarComprobantePdf(id);

    // Configuramos las cabeceras para que el navegador entienda que es un PDF
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=comprobante-${id.substring(0,8)}.pdf`,
      'Content-Length': buffer.length,
    });

    // Enviamos el archivo binario
    res.end(buffer);
  }
}