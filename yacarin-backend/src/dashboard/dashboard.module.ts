import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { TipoCambioModule } from '../tipo-cambio/tipo-cambio.module';

@Module({
  imports: [TipoCambioModule], // Importamos el módulo para calcular ventas en Bs
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}