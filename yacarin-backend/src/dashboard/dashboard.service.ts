import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Pedido } from '../pedidos/entities/pedido.entity';
import { Producto } from '../productos/entities/producto.entity';
import { OrdenProduccion } from '../orden-produccion/entities/orden-produccion.entity';
import { TipoCambioService } from '../tipo-cambio/tipo-cambio.service';

@Injectable()
export class DashboardService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly tipoCambioService: TipoCambioService 
  ) {}

  async obtenerMetricasPrincipales() {
    try {
      let tasaDolar = 1;
      try {
        const tasa = await this.tipoCambioService.findByMoneda('USD');
        tasaDolar = tasa.valor_bs;
      } catch (e) {
        console.warn('Alerta: Sin tipo de cambio, usando 1:1 en el dashboard');
      }

      const { total_ventas_usd } = await this.dataSource
        .createQueryBuilder(Pedido, 'pedido')
        .select('SUM(pedido.total_usd)', 'total_ventas_usd')
        .where('pedido.estado != :estado', { estado: 'PENDIENTE' })
        .getRawOne();

      const ingresosUsd = Number(total_ventas_usd || 0);
      const ingresosBs = Number((ingresosUsd * tasaDolar).toFixed(2));

      // 3. Contar cuántos pedidos están pendientes de envío
      const pedidosPendientes = await this.dataSource
        .getRepository(Pedido)
        .count({ where: { estado: 'PENDIENTE' } });

      // 4. Contar cuántas órdenes de producción están actualmente en el taller
      const ordenesEnProceso = await this.dataSource
        .getRepository(OrdenProduccion)
        .count({ where: { estado: 'EN_PROCESO' } });

      // 5. Detectar productos con stock crítico (menos de 5 unidades, por ejemplo)
      const productosBajoStock = await this.dataSource
        .getRepository(Producto)
        .find({
          where: { activo: true },
          select: {
            id: true,
            nombre_comercial: true,
            talla: true,
            stock_actual: true,
          },
          order: { stock_actual: 'ASC' }, // Los que tienen menos stock primero
          take: 5 // Solo mostramos los 5 más urgentes para no saturar la vista
        });

      // 6. Empaquetamos todo en un único objeto limpio para el frontend
      return {
        ingresos: {
          usd: ingresosUsd,
          bs: ingresosBs
        },
        operaciones: {
          pedidos_pendientes: pedidosPendientes,
          taller_en_proceso: ordenesEnProceso
        },
        alertas_stock: productosBajoStock
      };

    } catch (error) {
      console.error('Error calculando métricas:', error);
      throw new InternalServerErrorException('Error al compilar las estadísticas del dashboard');
    }
  }
}