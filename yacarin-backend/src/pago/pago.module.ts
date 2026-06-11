import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PagoService } from './pago.service';
import { PagoController } from './pago.controller';
import { Pago } from './entities/pago.entity';
import { PedidosModule } from '../pedidos/pedidos.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Pago]),
    forwardRef(() => PedidosModule),
    MailModule
  ],
  controllers: [PagoController],
  providers: [PagoService],
})
export class PagoModule {}
