import { Controller, Get, UseGuards } from '@nestjs/common';
import { LogAccesoService } from './log-acceso.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('log-acceso')
export class LogAccesoController {
  constructor(private readonly logAccesoService: LogAccesoService) {}

  // Protegemos la ruta para que solo gente con token pueda ver la auditoría
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.logAccesoService.findAll();
  }
}