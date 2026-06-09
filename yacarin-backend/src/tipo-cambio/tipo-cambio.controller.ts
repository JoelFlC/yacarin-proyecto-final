import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { TipoCambioService } from './tipo-cambio.service';
import { CreateTipoCambioDto } from './dto/create-tipo-cambio.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('tipo-cambio')
export class TipoCambioController {
  constructor(private readonly tipoCambioService: TipoCambioService) {}

  // Ruta protegida: Solo alguien logueado puede modificar el tipo de cambio
  @UseGuards(JwtAuthGuard)
  @Post()
  upsert(@Body() createTipoCambioDto: CreateTipoCambioDto) {
    return this.tipoCambioService.upsert(createTipoCambioDto);
  }

  // Ruta pública: El frontend la necesita para mostrar precios en tiempo real sin estar logueado
  @Get()
  findAll() {
    return this.tipoCambioService.findAll();
  }

  @Get(':moneda')
  findOne(@Param('moneda') moneda: string) {
    return this.tipoCambioService.findByMoneda(moneda);
  }
}