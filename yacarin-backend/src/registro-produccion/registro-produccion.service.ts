import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRegistroProduccionDto } from './dto/create-registro-produccion.dto';
import { RegistroProduccion } from './entities/registro-produccion.entity';
import { OrdenProduccion } from '../orden-produccion/entities/orden-produccion.entity';
import { Empleado } from '../empleados/entities/empleado.entity';
import { TarifaProduccion } from '../tarifas/entities/tarifa.entity';

@Injectable()
export class RegistroProduccionService {

  constructor(
    @InjectRepository(RegistroProduccion)
    private readonly registroRepo: Repository<RegistroProduccion>,
    @InjectRepository(OrdenProduccion)
    private readonly ordenRepo: Repository<OrdenProduccion>,
    @InjectRepository(Empleado)
    private readonly empleadoRepo: Repository<Empleado>,
    @InjectRepository(TarifaProduccion) // INYECCIÓN DE LA NUEVA TABLA
    private readonly tarifaRepo: Repository<TarifaProduccion>,
  ) {}

  async registrarTrabajo(dto: CreateRegistroProduccionDto) {
    // 1. Validar que la orden existe
    const orden = await this.ordenRepo.findOne({ where: { id: dto.orden_id } });
    if (!orden) throw new NotFoundException('La orden de producción no existe.');

    // 2. Validar que el empleado existe
    const empleado = await this.empleadoRepo.findOne({ where: { usuario_id: dto.empleado_id } });
    if (!empleado) throw new NotFoundException('El empleado no está registrado en el sistema.');

    // 3. Obtener la tarifa correspondiente
    const tarea = dto.tarea_realizada.toUpperCase();


    const tarifaRecord = await this.tarifaRepo.findOne({ where: { tarea } });
    if (!tarifaRecord) {
      throw new BadRequestException(`La tarea '${tarea}' no tiene una tarifa asignada.`);
    }

    const tarifa_unidad = tarifaRecord.precio_bs;
    const total_a_pagar = dto.cantidad_producida * tarifa_unidad;

    // 5. Guardar el registro
    const nuevoRegistro = this.registroRepo.create({
      orden,
      empleado,
      tarea_realizada: tarea,
      cantidad_producida: dto.cantidad_producida,
      tarifa_unidad,
      total_a_pagar,
      estado_pago: 'PENDIENTE'
    });

    await this.registroRepo.save(nuevoRegistro);

    return {
      message: 'Registro de trabajo guardado exitosamente.',
      boleta: {
        empleado_id: empleado.usuario_id,
        tarea: tarea,
        cantidad: dto.cantidad_producida,
        pago_generado_bs: total_a_pagar
      }
    };
  }

  // Criterio para el Frontend: Que el empleado pueda ver su historial de trabajo
  async obtenerHistorialEmpleado(empleado_id: string) {
    return this.registroRepo.find({
      where: { empleado: { usuario_id: empleado_id } },
      relations: {
        orden: true
      }, 
    });
  }

  // Criterio para el Frontend: Dashboard analítico
  async findAll() {
    return this.registroRepo.find({
      relations: {
        empleado: { usuario: true },
        orden: { producto: true }
      }
    });
  }
}