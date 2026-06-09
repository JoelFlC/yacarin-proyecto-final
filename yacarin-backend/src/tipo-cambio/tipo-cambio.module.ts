import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TipoCambioService } from './tipo-cambio.service';
import { TipoCambioController } from './tipo-cambio.controller';
import { TipoCambio } from './entities/tipo-cambio.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TipoCambio])],
  controllers: [TipoCambioController],
  providers: [TipoCambioService],
  exports: [TipoCambioService] // <-- Añadimos esta línea
})
export class TipoCambioModule {}