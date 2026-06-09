import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { RegistroProduccionService } from './registro-produccion.service';
import { CreateRegistroProduccionDto } from './dto/create-registro-produccion.dto';

@Controller('registro-produccion')
export class RegistroProduccionController {
  constructor(private readonly registroProduccionService: RegistroProduccionService) {}

  @Post()
  registrarTrabajo(@Body() createRegistroProduccionDto: CreateRegistroProduccionDto) {
    return this.registroProduccionService.registrarTrabajo(createRegistroProduccionDto);
  }

  @Get('empleado/:id')
  obtenerHistorial(@Param('id') empleado_id: string) {
    return this.registroProduccionService.obtenerHistorialEmpleado(empleado_id);
  }

  @Get()
  findAll() {
    return this.registroProduccionService.findAll();
  }
}