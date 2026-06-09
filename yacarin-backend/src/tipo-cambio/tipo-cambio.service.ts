import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTipoCambioDto } from './dto/create-tipo-cambio.dto';
import { TipoCambio } from './entities/tipo-cambio.entity';

@Injectable()
export class TipoCambioService {
  constructor(
    @InjectRepository(TipoCambio)
    private readonly tipoCambioRepository: Repository<TipoCambio>,
  ) {}

  async upsert(createTipoCambioDto: CreateTipoCambioDto) {
    // 1. Buscamos si ya existe la moneda (ej. 'USD')
    const existente = await this.tipoCambioRepository.findOneBy({
      moneda: createTipoCambioDto.moneda.toUpperCase(), // Forzamos mayúsculas
    });

    if (existente) {
      existente.valor_bs = createTipoCambioDto.valor_bs;
      return await this.tipoCambioRepository.save(existente);
    }

    const nuevo = this.tipoCambioRepository.create({
      moneda: createTipoCambioDto.moneda.toUpperCase(),
      valor_bs: createTipoCambioDto.valor_bs,
    });
    return await this.tipoCambioRepository.save(nuevo);
  }

  findAll() {
    return this.tipoCambioRepository.find();
  }

  async findByMoneda(moneda: string) {
    const tasa = await this.tipoCambioRepository.findOneBy({ moneda: moneda.toUpperCase() });
    if (!tasa) {
      throw new NotFoundException(`Tipo de cambio para ${moneda} no encontrado`);
    }
    return tasa;
  }
}