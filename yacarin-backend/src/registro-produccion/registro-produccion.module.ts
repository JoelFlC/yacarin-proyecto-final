import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegistroProduccionService } from './registro-produccion.service';
import { RegistroProduccionController } from './registro-produccion.controller';
import { RegistroProduccion } from './entities/registro-produccion.entity';
import { OrdenProduccion } from '../orden-produccion/entities/orden-produccion.entity';
import { Empleado } from '../empleados/entities/empleado.entity';
import { TarifasModule } from 'src/tarifas/tarifas.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RegistroProduccion, OrdenProduccion, Empleado]),
    TarifasModule
  ],
  controllers: [RegistroProduccionController],
  providers: [RegistroProduccionService],
})
export class RegistroProduccionModule {}