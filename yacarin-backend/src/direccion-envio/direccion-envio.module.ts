import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DireccionEnvioService } from './direccion-envio.service';
import { DireccionEnvioController } from './direccion-envio.controller';
import { DireccionEnvio } from './entities/direccion-envio.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DireccionEnvio])],
  controllers: [DireccionEnvioController],
  providers: [DireccionEnvioService],
})
export class DireccionEnvioModule {}
