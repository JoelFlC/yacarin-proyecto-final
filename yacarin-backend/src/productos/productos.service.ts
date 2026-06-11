import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductoDto } from './dto/create-producto.dto';
import { Producto } from './entities/producto.entity';
import { TipoCambioService } from '../tipo-cambio/tipo-cambio.service';
import { RecetaMaterialService } from '../receta-material/receta-material.service';

@Injectable()
export class ProductosService {
  constructor(
    @InjectRepository(Producto)
    private readonly productoRepository: Repository<Producto>,
    private readonly tipoCambioService: TipoCambioService, 
    private readonly recetaMaterialService: RecetaMaterialService
  ) {}

  // 1. El método para crear que se había borrado
  async create(createProductoDto: CreateProductoDto) {
    const nuevoProducto = this.productoRepository.create({
      nombre_comercial: createProductoDto.nombre_comercial,
      talla: createProductoDto.talla,
      precio_base_usd: createProductoDto.precio_base_usd,
      descuento_mayorista: createProductoDto.descuento_mayorista || 0,
      stock_actual: 0, // El stock siempre nace en 0
      imagen_url: createProductoDto.imagen_url,
      diseno: { id: createProductoDto.diseno_id } 
    });
    
    const productoGuardado = await this.productoRepository.save(nuevoProducto);

    if (createProductoDto.receta_json) {
      try {
        const receta = JSON.parse(createProductoDto.receta_json);
        for (const item of receta) {
          await this.recetaMaterialService.asignarMaterial({
            producto_id: productoGuardado.id,
            material_id: item.material_id,
            cantidad_requerida: item.cantidad_requerida
          });
        }
      } catch (error) {
        console.error('Error al parsear receta_json en creación', error);
      }
    }

    return productoGuardado;
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
    
    // 2. Fusionamos los datos nuevos enviados desde el frontend (ignoramos receta_json para el merge)
    const datosFusion = { ...updateProductoDto };
    delete datosFusion.receta_json;

    if (datosFusion.diseno_id) {
      datosFusion.diseno = { id: datosFusion.diseno_id };
      delete datosFusion.diseno_id;
    }

    const productoActualizado = this.productoRepository.merge(producto, datosFusion);
    
    // 3. Guardamos los cambios
    const resultado = await this.productoRepository.save(productoActualizado);

    // 4. Actualizar receta si fue enviada
    if (updateProductoDto.receta_json) {
      try {
        const receta = JSON.parse(updateProductoDto.receta_json);
        await this.recetaMaterialService.removeByProducto(id);
        for (const item of receta) {
          await this.recetaMaterialService.asignarMaterial({
            producto_id: id,
            material_id: item.material_id,
            cantidad_requerida: item.cantidad_requerida
          });
        }
      } catch (error) {
        console.error('Error al parsear receta_json en update', error);
      }
    }

    return resultado;
  }

  // 4. El método de eliminación lógica que se había borrado
  async remove(id: string) {
    const producto = await this.findOne(id);
    producto.activo = false; 
    return await this.productoRepository.save(producto);
  }
}