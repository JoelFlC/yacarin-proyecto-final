import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, IsNull } from 'typeorm';
import { Cliente } from './entities/cliente.entity';
import { UpdateClienteDto } from './dto/update-cliente.dto';

@Injectable()
export class ClientesService {
  constructor(
    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,
  ) {}

  // 1. Listar todos: Traemos la relación con 'usuario' para ver nombre, apellido y email en la tabla
  async findAll() {
    return await this.clienteRepository.find({
      relations: { usuario: true },
    });
  }

  // 2. Buscar uno solo: Buscamos a través de la relación de usuario_id
  async findOne(id: string) {
    const cliente = await this.clienteRepository.findOne({
      where: { usuario: { id: id } }, // Buscamos por el ID del usuario del sistema
      relations: { usuario: true },
    });
    
    if (!cliente) {
      throw new NotFoundException(`Cliente con ID de usuario ${id} no encontrado.`);
    }
    return cliente;
  }

  // 3. Editar datos comerciales (NIT, Razón Social)
  async update(id: string, updateClienteDto: UpdateClienteDto) {
    // Buscamos el cliente con nuestro método seguro
    const cliente = await this.findOne(id);
    
    // Fusionamos solo los datos comerciales (NIT, Razón Social)
    const clienteActualizado = this.clienteRepository.merge(cliente, updateClienteDto);
    return await this.clienteRepository.save(clienteActualizado);
  }

  // 4. Aprobar B2B
  async aprobarB2b(id: string) {
    const cliente = await this.findOne(id);
    
    cliente.tipo_cliente = 'MAYORISTA';
    return await this.clienteRepository.save(cliente);
  }

  // 5. Listar peticiones B2B pendientes
  async findPeticionesB2b() {
    return await this.clienteRepository.find({
      where: {
        nit: Not(IsNull()),
        tipo_cliente: Not('MAYORISTA'),
      },
      relations: { usuario: true },
    });
  }

  // 6. Rechazar B2B
  async rechazarB2b(id: string) {
    const cliente = await this.findOne(id);
    cliente.nit = null as any;
    cliente.razon_social = null as any;
    return await this.clienteRepository.save(cliente);
  }
}