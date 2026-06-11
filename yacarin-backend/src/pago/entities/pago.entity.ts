import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Pedido } from '../../pedidos/entities/pedido.entity';
import { TipoCambio } from '../../tipo-cambio/entities/tipo-cambio.entity';

@Entity('PAGO')
export class Pago {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => Pedido, pedido => pedido.id, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'pedido_id' })
    pedido!: Pedido;

    @ManyToOne(() => TipoCambio)
    @JoinColumn({ name: 'tipo_cambio_id' })
    tipo_cambio!: TipoCambio;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    monto_pagado_usd!: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    monto_pagado_bs!: number;

    @Column({ type: 'varchar', length: 100 })
    metodo_pago!: string; // ej: 'Transferencia', 'QR', 'Efectivo'

    @Column({ type: 'varchar', length: 50 })
    tipo_pago!: string; // ej: 'Abono', 'Liquidacion', 'Total'

    @Column({ type: 'text', nullable: true })
    concepto!: string;

    @Column({ default: 'PENDIENTE' })
    estado_validacion!: string; // 'PENDIENTE', 'APROBADO', 'RECHAZADO'

    @CreateDateColumn()
    fecha_pago!: Date;
}
