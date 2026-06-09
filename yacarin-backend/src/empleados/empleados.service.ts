import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
// Asegúrate de importar el DTO de actualización y la Entidad correcta
import { UpdateEmpleadoDto } from './dto/update-empleado.dto';
import { Empleado } from './entities/empleado.entity';

@Injectable()
export class EmpleadosService {
  constructor(
    @InjectRepository(Empleado)
    private readonly empleadoRepo: Repository<Empleado>,
  ) {}

  // Este es el método que actualmente devuelve el texto string
  async findAll() {
    // Ahora devolverá un arreglo JSON con todos los empleados reales
    return this.empleadoRepo.find({
      // Si el empleado está vinculado a un usuario, traemos esos datos también
      relations: { usuario: true }
    });
  }

  // BUSCAMOS POR usuario_id EN LUGAR DE id
  async findOne(id: string) {
    const empleado = await this.empleadoRepo.findOne({
      // Aquí está el cambio clave: le decimos que busque en la columna de la relación
      where: { usuario: { id: id } }, 
      relations: { usuario: true }
    });
    
    if (!empleado) throw new NotFoundException(`Empleado vinculado al usuario ${id} no encontrado`);
    return empleado;
  }

  async update(id: string, updateEmpleadoDto: UpdateEmpleadoDto) {
    // 1. Buscamos al empleado con el método corregido
    const empleado = await this.findOne(id);
    
    // 2. Fusionamos y guardamos
    const empleadoActualizado = this.empleadoRepo.merge(empleado, updateEmpleadoDto);
    return await this.empleadoRepo.save(empleadoActualizado);
  }
}