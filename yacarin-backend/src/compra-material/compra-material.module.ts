import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompraMaterialService } from './compra-material.service';
import { CompraMaterialController } from './compra-material.controller';
import { CompraMaterial } from './entities/compra-material.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CompraMaterial])],
  controllers: [CompraMaterialController],
  providers: [CompraMaterialService],
})
export class CompraMaterialModule {}
