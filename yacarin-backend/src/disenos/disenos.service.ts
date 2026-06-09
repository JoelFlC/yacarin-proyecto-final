import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDisenoDto } from './dto/create-diseno.dto';
import { Diseno } from './entities/diseno.entity';

@Injectable()
export class DisenosService {
  constructor(
    @InjectRepository(Diseno)
    private readonly disenoRepository: Repository<Diseno>,
  ) {}

  async create(createDisenoDto: CreateDisenoDto) {
    const nuevoDiseno = this.disenoRepository.create(createDisenoDto);
    return await this.disenoRepository.save(nuevoDiseno);
  }


  findAll() {
    return this.disenoRepository.find({
      where: { activo: true },
      relations: { productos: true }
    });
  }

  async findOne(id: string) {
    const diseno = await this.disenoRepository.findOne({
      where: { id, activo: true },
      relations: { productos: true }
    });
    
    if (!diseno) {
      throw new NotFoundException(`Diseño con id ${id} no encontrado`);
    }
    return diseno;
  }

  async update(id: string, updateDisenoDto: any) {
    // Buscamos el diseño
    const diseno = await this.disenoRepository.findOne({ where: { id, activo: true } });
    
    if (!diseno) {
      throw new NotFoundException(`Diseño con ID ${id} no encontrado`);
    }

    // Actualizamos
    const disenoActualizado = this.disenoRepository.merge(diseno, updateDisenoDto);
    return await this.disenoRepository.save(disenoActualizado);
  }
  
  // Eliminación Lógica 
  async remove(id: string) {
    const diseno = await this.findOne(id);
    diseno.activo = false;
    return await this.disenoRepository.save(diseno);
  }
}