import { Controller, Get, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { EmpleadosService } from './empleados.service';
import { UpdateEmpleadoDto } from './dto/update-empleado.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

// Todo este controlador responde a la ruta base /empleados
@UseGuards(JwtAuthGuard)
@Controller('empleados')
export class EmpleadosController {
  constructor(private readonly empleadosService: EmpleadosService) {}

  // 1. Ruta sin parámetros (GET /empleados) -> Lista todos
  @Get()
  findAll() {
    return this.empleadosService.findAll();
  }

  // 2. Ruta con parámetro ID (GET /empleados/123e4567...) -> Busca uno solo
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.empleadosService.findOne(id);
  }

  // 3. Ruta para actualizar (PATCH /empleados/123e4567...)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEmpleadoDto: UpdateEmpleadoDto) {
    return this.empleadosService.update(id, updateEmpleadoDto);
  }
}