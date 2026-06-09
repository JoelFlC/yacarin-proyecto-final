import { Controller, Get, Post, Body, Param, Patch, UseGuards, Res } from '@nestjs/common';
import { OrdenProduccionService } from './orden-produccion.service';
import { CreateOrdenProduccionDto } from './dto/create-orden-produccion.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard) // Toda la gestión del taller requiere permisos de empleado/admin
@Controller('orden-produccion')
export class OrdenProduccionController {
  constructor(private readonly ordenService: OrdenProduccionService) {}

  @Post()
  create(@Body() createDto: CreateOrdenProduccionDto) {
    return this.ordenService.create(createDto);
  }

  @Get()
  findAll() {
    return this.ordenService.findAll();
  }

  // Ruta para dar por terminada la costura: /orden-produccion/uuid-de-la-orden/completar
  @Patch(':id/completar')
  completar(@Param('id') id: string) {
    return this.ordenService.completar(id);
  }

  // Descarga del PDF de producción
  @Get('reporte/pdf')
  async descargarReporte(@Res() res: any) {
    const buffer = await this.ordenService.generarReportePdf();
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=reporte-produccion.pdf',
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }
}