import { Injectable, OnModuleInit, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TarifaProduccion } from './entities/tarifa.entity';

@Injectable()
export class TarifasService implements OnModuleInit {
  constructor(
    @InjectRepository(TarifaProduccion)
    private readonly tarifaRepo: Repository<TarifaProduccion>,
  ) {}

  async onModuleInit() {
    const count = await this.tarifaRepo.count();
    if (count === 0) {
      const tarifasBase = [
        { tarea: 'CORTE', precio_bs: 1.50 },
        { tarea: 'COSTURA', precio_bs: 10.00 },
        { tarea: 'EMPAQUE', precio_bs: 0.50 },
        { tarea: 'TEJEDURIA', precio_bs: 20.00 },
      ];
      await this.tarifaRepo.save(tarifasBase);
      console.log('Tarifas base inicializadas dinámicamente.');
    }
  }

  findAll() {
    return this.tarifaRepo.find();
  }

  async actualizarTarifa(tarea: string, nuevoPrecio: number) {
    const tarifa = await this.tarifaRepo.findOne({ where: { tarea: tarea.toUpperCase() } });
    if (!tarifa) throw new NotFoundException(`La tarea ${tarea} no existe.`);

    tarifa.precio_bs = nuevoPrecio;
    await this.tarifaRepo.save(tarifa);
    return { message: 'Tarifa actualizada correctamente', tarifa };
  }
}