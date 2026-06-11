import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { DetallePedido } from './detalle-pedido.entity';
import { DireccionEnvio } from '../../direccion-envio/entities/direccion-envio.entity';
import { TipoCambio } from '../../tipo-cambio/entities/tipo-cambio.entity';

@Entity('PEDIDO')
export class Pedido {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => Usuario)
    @JoinColumn({ name: 'cliente_id' })
    cliente!: Usuario;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    total_usd!: number;

    @Column({ default: 'PENDIENTE' }) 
    estado!: string;

    @ManyToOne(() => DireccionEnvio, { nullable: true })
    @JoinColumn({ name: 'direccion_id' })
    direccion!: DireccionEnvio;

    @ManyToOne(() => TipoCambio)
    @JoinColumn({ name: 'tipo_cambio_id' })
    tipo_cambio!: TipoCambio;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    costo_envio!: number;

    @CreateDateColumn()
    fecha_pedido!: Date;

    @OneToMany(() => DetallePedido, detalle => detalle.pedido, { cascade: true })
    detalles!: DetallePedido[];
}