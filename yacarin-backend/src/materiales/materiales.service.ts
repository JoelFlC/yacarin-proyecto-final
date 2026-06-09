import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateMaterialDto } from './dto/create-materiale.dto';
import { Material } from './entities/materiale.entity';

@Injectable()
export class MaterialesService {
  constructor(
    @InjectRepository(Material)
    private readonly materialRepository: Repository<Material>,
  ) {}

  async create(createMaterialDto: CreateMaterialDto) {
    const nuevoMaterial = this.materialRepository.create(createMaterialDto);
    return await this.materialRepository.save(nuevoMaterial);
  }

  findAll() {
    return this.materialRepository.find({ where: { activo: true } });
  }

  async findOne(id: string) {
    const material = await this.materialRepository.findOneBy({ id, activo: true });
    if (!material) throw new NotFoundException(`Material con id ${id} no encontrado`);
    return material;
  }

  async update(id: string, updateMaterialDto: any) {
    const material = await this.findOne(id);
    Object.assign(material, updateMaterialDto);
    return await this.materialRepository.save(material);
  }

  async remove(id: string) {
    const material = await this.findOne(id);
    material.activo = false;
    return await this.materialRepository.save(material);
  }
}