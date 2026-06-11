import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { DireccionEnvioService } from './direccion-envio.service';
import { CreateDireccionEnvioDto } from './dto/create-direccion-envio.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('direccion-envio')
export class DireccionEnvioController {
  constructor(private readonly direccionEnvioService: DireccionEnvioService) {}

  @Post()
  create(@Request() req: any, @Body() createDto: CreateDireccionEnvioDto) {
    return this.direccionEnvioService.create(req.user.id, createDto);
  }

  @Get()
  findByUsuario(@Request() req: any) {
    return this.direccionEnvioService.findByUsuario(req.user.id);
  }
}
