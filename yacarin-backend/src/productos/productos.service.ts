import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductoDto } from './dto/create-producto.dto';
import { Producto } from './entities/producto.entity';
import { TipoCambioService } from '../tipo-cambio/tipo-cambio.service';

@Injectable()
export class ProductosService {
  constructor(
    @InjectRepository(Producto)
    private readonly productoRepository: Repository<Producto>,
    private readonly tipoCambioService: TipoCambioService, 
  ) {}

  // 1. El método para crear que se había borrado
  async create(createProductoDto: CreateProductoDto) {
    const nuevoProducto = this.productoRepository.create({
      nombre_comercial: createProductoDto.nombre_comercial,
      talla: createProductoDto.talla,
      precio_base_usd: createProductoDto.precio_base_usd,
      descuento_mayorista: createProductoDto.descuento_mayorista || 0,
      stock_actual: createProductoDto.stock_actual,
      imagen_url: createProductoDto.imagen_url,
      diseno: { id: createProductoDto.diseno_id } 
    });
    
    return await this.productoRepository.save(nuevoProducto);
  }

  // 2. El método mágico bimonetario que acabamos de programar
  async findAll() {
    const productos = await this.productoRepository.find({
      where: { activo: true },
      relations: { diseno: true }
    });

    let tasaDolar = 1; 
    try {
      const tasa = await this.tipoCambioService.findByMoneda('USD');
      tasaDolar = tasa.valor_bs;
    } catch (error) {
      console.warn('Alerta: No se encontró el tipo de cambio USD, calculando 1 a 1');
    }

    return productos.map(producto => {
      const precioBs = Number((producto.precio_base_usd * tasaDolar).toFixed(2));
      return {
        ...producto,
        precio_base_bs: precioBs 
      };
    });
  }

  // 3. El método de búsqueda individual que se había borrado
  async findOne(id: string) {
    const producto = await this.productoRepository.findOne({
      where: { id, activo: true },
      relations: { diseno: true }
    });
    
    if (!producto) {
      throw new NotFoundException(`Producto físico con id ${id} no encontrado`);
    }
    return producto;
  }

  // Añade este método a tu servicio
  async update(id: string, updateProductoDto: any) {
    // 1. Utilizamos tu findOne existente (que ya valida que el producto exista y esté activo)
    const producto = await this.findOne(id);
    
    // 2. Fusionamos los datos nuevos enviados desde el frontend
    const productoActualizado = this.productoRepository.merge(producto, updateProductoDto);
    
    // 3. Guardamos los cambios
    return await this.productoRepository.save(productoActualizado);
  }

  // 4. El método de eliminación lógica que se había borrado
  async remove(id: string) {
    const producto = await this.findOne(id);
    producto.activo = false; 
    return await this.productoRepository.save(producto);
  }
}