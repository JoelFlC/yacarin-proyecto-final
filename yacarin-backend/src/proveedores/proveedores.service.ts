import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProveedorDto } from './dto/create-proveedore.dto';
import { UpdateProveedorDto } from './dto/update-proveedore.dto';
import { Proveedor } from './entities/proveedore.entity';

@Injectable()
export class ProveedoresService {
  constructor(
    @InjectRepository(Proveedor)
    private readonly proveedorRepository: Repository<Proveedor>,
  ) { }

  async create(createProveedorDto: CreateProveedorDto) {
    const nuevoProveedor = this.proveedorRepository.create(createProveedorDto);
    return await this.proveedorRepository.save(nuevoProveedor);
  }

  findAll() {
    return this.proveedorRepository.find({ where: { activo: true } });
  }

  async findOne(id: string) {
    const proveedor = await this.proveedorRepository.findOneBy({ id, activo: true });
    if (!proveedor) throw new NotFoundException(`Proveedor con id ${id} no encontrado`);
    return proveedor;
  }

  async update(id: string, updateProveedorDto: UpdateProveedorDto) {
    const proveedor = await this.findOne(id);
    const proveedorActualizado = this.proveedorRepository.merge(proveedor, updateProveedorDto);
    return await this.proveedorRepository.save(proveedorActualizado);
  }

  async remove(id: string) {
    const proveedor = await this.findOne(id);
    proveedor.activo = false;
    return await this.proveedorRepository.save(proveedor);
  }
}