import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRecetaMaterialDto } from './dto/create-receta-material.dto';
import { RecetaMaterial } from './entities/receta-material.entity';
import { Producto } from '../productos/entities/producto.entity';
import { Material } from '../materiales/entities/materiale.entity';

@Injectable()
export class RecetaMaterialService {
  constructor(
    @InjectRepository(RecetaMaterial)
    private readonly recetaRepo: Repository<RecetaMaterial>,
    @InjectRepository(Producto)
    private readonly productoRepo: Repository<Producto>,
    @InjectRepository(Material)
    private readonly materialRepo: Repository<Material>,
  ) {}

  async asignarMaterial(dto: CreateRecetaMaterialDto) {
    // 1. Validar que ambas piezas existan
    const producto = await this.productoRepo.findOne({ where: { id: dto.producto_id } });
    if (!producto) throw new NotFoundException('El producto no existe.');

    const material = await this.materialRepo.findOne({ where: { id: dto.material_id } });
    if (!material) throw new NotFoundException('El material no existe en el inventario.');

    // 2. Buscar si la receta ya tiene este material asignado (Upsert)
    let receta = await this.recetaRepo.findOne({
      where: { producto_id: dto.producto_id, material_id: dto.material_id }
    });

    if (receta) {
      // Si ya existe, actualizamos la cantidad
      receta.cantidad_requerida = dto.cantidad_requerida;
    } else {
      // Si no existe, creamos el enlace nuevo
      receta = this.recetaRepo.create({
        producto_id: dto.producto_id,
        material_id: dto.material_id,
        cantidad_requerida: dto.cantidad_requerida,
      });
    }

    await this.recetaRepo.save(receta);

    return {
      message: 'Fórmula de producción actualizada con éxito',
      receta
    };
  }

  // Permite consultar todos los materiales que requiere un producto específico
  async findByProducto(producto_id: string) {
    return this.recetaRepo.find({
      where: { producto_id },
      relations: { material: true }
    });
  }

  async removeByProducto(producto_id: string) {
    await this.recetaRepo.delete({ producto_id });
  }
}