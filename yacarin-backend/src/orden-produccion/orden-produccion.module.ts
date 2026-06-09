import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdenProduccionService } from './orden-produccion.service';
import { OrdenProduccionController } from './orden-produccion.controller';
import { OrdenProduccion } from './entities/orden-produccion.entity';
import { OrdenMaterial } from './entities/orden-material.entity';
import { ProductosModule } from '../productos/productos.module';
import { MaterialesModule } from '../materiales/materiales.module';
import { RecetaMaterialModule } from '../receta-material/receta-material.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrdenProduccion, OrdenMaterial]),
    ProductosModule,
    MaterialesModule,
    RecetaMaterialModule
  ],
  controllers: [OrdenProduccionController],
  providers: [OrdenProduccionService],
})
export class OrdenProduccionModule {}