import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { CompraMaterialService } from './compra-material.service';
import { CreateCompraMaterialDto } from './dto/create-compra-material.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('compra-material')
export class CompraMaterialController {
  constructor(private readonly compraMaterialService: CompraMaterialService) {}

  @Post()
  create(@Body() createDto: CreateCompraMaterialDto) {
    return this.compraMaterialService.create(createDto);
  }

  @Get()
  findAll() {
    return this.compraMaterialService.findAll();
  }
}
