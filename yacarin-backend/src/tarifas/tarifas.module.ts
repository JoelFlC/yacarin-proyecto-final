import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TarifasService } from './tarifas.service';
import { TarifasController } from './tarifas.controller';
import { TarifaProduccion } from './entities/tarifa.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TarifaProduccion])],
  controllers: [TarifasController],
  providers: [TarifasService],
  // Exportamos TypeOrmModule para compartir el repositorio con el ERP
  exports: [TypeOrmModule], 
})
export class TarifasModule {}