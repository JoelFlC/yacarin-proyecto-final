import { Controller, Post, Body, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { PagoService } from './pago.service';
import { CreatePagoDto } from './dto/create-pago.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('pago')
export class PagoController {
  constructor(private readonly pagoService: PagoService) {}

  @Post()
  create(@Body() createPagoDto: CreatePagoDto) {
    return this.pagoService.create(createPagoDto);
  }

  @Get()
  findAll() {
    return this.pagoService.findAll();
  }

  @Get('pedido/:id')
  findByPedido(@Param('id') id: string) {
    return this.pagoService.findByPedido(id);
  }

  @Patch(':id/aprobar')
  aprobar(@Param('id') id: string) {
    return this.pagoService.aprobarPago(id);
  }
}
