import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductosService } from './productos.service';
import { ProductosController } from './productos.controller';
import { Producto } from './entities/producto.entity';
import { TipoCambioModule } from '../tipo-cambio/tipo-cambio.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Producto]),
    TipoCambioModule
  ],
  controllers: [ProductosController],
  providers: [ProductosService],
  exports: [TypeOrmModule] // <-- ¡Agregamos esta línea para compartir la tabla Producto!
})
export class ProductosModule {}