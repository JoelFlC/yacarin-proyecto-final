import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DireccionEnvio } from './entities/direccion-envio.entity';
import { CreateDireccionEnvioDto } from './dto/create-direccion-envio.dto';

@Injectable()
export class DireccionEnvioService {
  constructor(
    @InjectRepository(DireccionEnvio)
    private direccionRepository: Repository<DireccionEnvio>
  ) {}

  async create(usuarioId: string, dto: CreateDireccionEnvioDto) {
    const direccion = this.direccionRepository.create({
      ...dto,
      cliente: { id: usuarioId }
    });
    return await this.direccionRepository.save(direccion);
  }

  async findByUsuario(usuarioId: string) {
    return await this.direccionRepository.find({
      where: { cliente: { id: usuarioId }, activa: true },
      order: { departamento: 'ASC' }
    });
  }
}
