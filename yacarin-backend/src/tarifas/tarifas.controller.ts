import { Controller, Get, Patch, Param, Body } from '@nestjs/common';
import { TarifasService } from './tarifas.service';

@Controller('tarifas')
export class TarifasController {
  constructor(private readonly tarifasService: TarifasService) {}

  @Get()
  findAll() {
    return this.tarifasService.findAll();
  }

  @Patch(':tarea')
  actualizarTarifa(
    @Param('tarea') tarea: string, 
    @Body('precio_bs') precio_bs: number
  ) {
    return this.tarifasService.actualizarTarifa(tarea, precio_bs);
  }
}