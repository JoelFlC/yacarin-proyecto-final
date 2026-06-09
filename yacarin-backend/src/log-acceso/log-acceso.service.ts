import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LogAcceso } from './entities/log-acceso.entity';

@Injectable()
export class LogAccesoService {
  constructor(
    @InjectRepository(LogAcceso)
    private readonly logRepository: Repository<LogAcceso>,
  ) {}

  async registrarAcceso(ip: string, evento: string, browser: string, usuarioId?: string) {
    const nuevoLog = this.logRepository.create({
      direccion_ip: ip,
      evento: evento,
      browser: browser,
      usuario: usuarioId ? { id: usuarioId } as any : null, 
    });
    await this.logRepository.save(nuevoLog);
  }

  // Agregamos esto para poder ver los registros
  findAll() {
    return this.logRepository.find({ 
      relations: {
        usuario: true
      } 
    }); 
  }
}