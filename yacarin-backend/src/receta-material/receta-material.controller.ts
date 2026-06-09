import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { RecetaMaterialService } from './receta-material.service';
import { CreateRecetaMaterialDto } from './dto/create-receta-material.dto';

@Controller('receta-material')
export class RecetaMaterialController {
  constructor(private readonly recetaMaterialService: RecetaMaterialService) {}

  @Post()
  asignarMaterial(@Body() createRecetaMaterialDto: CreateRecetaMaterialDto) {
    return this.recetaMaterialService.asignarMaterial(createRecetaMaterialDto);
  }

  @Get('producto/:id')
  obtenerReceta(@Param('id') id: string) {
    return this.recetaMaterialService.findByProducto(id);
  }
}