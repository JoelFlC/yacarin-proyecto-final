import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { DetallePedido } from './detalle-pedido.entity';

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

    @Column({ type: 'text', nullable: true })
    direccion_envio!: string; // Útil para envíos interdepartamentales

    @CreateDateColumn()
    fecha_pedido!: Date;

    @OneToMany(() => DetallePedido, detalle => detalle.pedido, { cascade: true })
    detalles!: DetallePedido[];
}