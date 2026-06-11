import { Injectable, BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CreateCompraMaterialDto } from './dto/create-compra-material.dto';
import { CompraMaterial } from './entities/compra-material.entity';
import { Material } from '../materiales/entities/materiale.entity';
import { TipoCambio } from '../tipo-cambio/entities/tipo-cambio.entity';

@Injectable()
export class CompraMaterialService {
  constructor(private dataSource: DataSource) {}

  async create(dto: CreateCompraMaterialDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Obtener Tipo de Cambio
      const tipoCambio = await queryRunner.manager.findOne(TipoCambio, { where: { moneda: 'USD' } });
      if (!tipoCambio) throw new BadRequestException('Tipo de cambio USD no configurado.');

      // 2. Validar Material
      const material = await queryRunner.manager.findOne(Material, { 
        where: { id: dto.material_id },
        lock: { mode: 'pessimistic_write' }
      });
      if (!material) throw new NotFoundException('Material no encontrado');

      // 3. Crear Registro de Compra
      const precio_bs = dto.precio_compra_usd * Number(tipoCambio.valor_bs);
      const compra = queryRunner.manager.create(CompraMaterial, {
        proveedor: { id: dto.proveedor_id },
        material: { id: dto.material_id },
        tipo_cambio: { id: tipoCambio.id },
        cantidad: dto.cantidad,
        precio_compra_usd: dto.precio_compra_usd,
        precio_compra_bs: precio_bs
      });
      await queryRunner.manager.save(compra);

      // 4. Actualizar Stock Físico
      material.stock_actual = Number(material.stock_actual) + Number(dto.cantidad);
      // Opcional: Actualizar el costo base (ej. al último precio de compra)
      material.costo_base_usd = dto.precio_compra_usd; 
      await queryRunner.manager.save(material);

      await queryRunner.commitTransaction();
      return compra;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error instanceof BadRequestException || error instanceof NotFoundException 
        ? error 
        : new InternalServerErrorException('Error al registrar la compra');
    } finally {
      await queryRunner.release();
    }
  }

  findAll() {
    return this.dataSource.getRepository(CompraMaterial).find({
      relations: { proveedor: true, material: true, tipo_cambio: true },
      order: { fecha_compra: 'DESC' }
    });
  }
}
