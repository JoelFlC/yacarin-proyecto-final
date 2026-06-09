import { Controller, Get, Post, Body, Param, Delete, UseGuards } from '@nestjs/common';
import { MaterialesService } from './materiales.service';
import { CreateMaterialDto } from './dto/create-materiale.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('materiales')
export class MaterialesController {
  constructor(private readonly materialesService: MaterialesService) {}

  @Post()
  create(@Body() createMaterialDto: CreateMaterialDto) {
    return this.materialesService.create(createMaterialDto);
  }

  @Get()
  findAll() {
    return this.materialesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.materialesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMaterialDto: any) {
    return this.materialesService.update(id, updateMaterialDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.materialesService.remove(id);
  }
}