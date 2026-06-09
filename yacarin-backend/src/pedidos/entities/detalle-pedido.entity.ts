import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Pedido } from './pedido.entity';
import { Producto } from '../../productos/entities/producto.entity';

@Entity('DETALLE_PEDIDO')
export class DetallePedido {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => Pedido, pedido => pedido.detalles, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'pedido_id' })
    pedido!: Pedido;

    @ManyToOne(() => Producto)
    @JoinColumn({ name: 'producto_id' })
    producto!: Producto;

    @Column({ type: 'int' })
    cantidad!: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    precio_unitario_usd!: number; // Guardamos el precio histórico por si el producto sube de precio mañana

    
}