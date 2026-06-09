import { Controller, Get, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { ClientesService } from './clientes.service';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard) // Protegemos todo el controlador por seguridad
@Controller('clientes')
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

  @Get()
  findAll() {
    return this.clientesService.findAll();
  }

  @Get('peticiones-b2b')
  findPeticionesB2b() {
    return this.clientesService.findPeticionesB2b();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clientesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateClienteDto: UpdateClienteDto) {
    return this.clientesService.update(id, updateClienteDto);
  }

  @Patch(':id/aprobar-b2b')
  aprobarB2b(@Param('id') id: string) {
    return this.clientesService.aprobarB2b(id);
  }

  @Patch(':id/rechazar-b2b')
  rechazarB2b(@Param('id') id: string) {
    return this.clientesService.rechazarB2b(id);
  }
}