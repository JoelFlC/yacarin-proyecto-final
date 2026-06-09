import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecetaMaterialService } from './receta-material.service';
import { RecetaMaterialController } from './receta-material.controller';
import { RecetaMaterial } from './entities/receta-material.entity';
import { Producto } from '../productos/entities/producto.entity';
import { Material } from '../materiales/entities/materiale.entity';

@Module({
  // Fíjate bien en esta línea, aquí debe estar Producto
  imports: [TypeOrmModule.forFeature([RecetaMaterial, Producto, Material])],
  controllers: [RecetaMaterialController],
  providers: [RecetaMaterialService],
  exports: [RecetaMaterialService]
})
export class RecetaMaterialModule {}