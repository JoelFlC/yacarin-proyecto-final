import { Controller, Get, Post, Body, Param, Delete, UseGuards, Patch } from '@nestjs/common';
import { DisenosService } from './disenos.service';
import { CreateDisenoDto } from './dto/create-diseno.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('disenos')
export class DisenosController {
  constructor(private readonly disenosService: DisenosService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createDisenoDto: CreateDisenoDto) {
    return this.disenosService.create(createDisenoDto);
  }

  // public
  @Get()
  findAll() {
    return this.disenosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.disenosService.findOne(id);
  }

  // admin
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.disenosService.remove(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDisenoDto: any) {
    return this.disenosService.update(id, updateDisenoDto);
  }
}