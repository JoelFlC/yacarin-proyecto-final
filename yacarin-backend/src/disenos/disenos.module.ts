import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DisenosService } from './disenos.service';
import { DisenosController } from './disenos.controller';
import { Diseno } from './entities/diseno.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Diseno])],
  controllers: [DisenosController],
  providers: [DisenosService],
})
export class DisenosModule {}
