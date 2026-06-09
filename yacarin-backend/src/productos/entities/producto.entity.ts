import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Diseno } from '../../disenos/entities/diseno.entity';

@Entity('PRODUCTO')
export class Producto {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    // Relación: Muchos Productos pertenecen a Un Diseño
    @ManyToOne(() => Diseno, (diseno) => diseno.productos)
    @JoinColumn({ name: 'diseno_id' }) // Crea la llave foránea física
    diseno!: Diseno;

    @Column()
    nombre_comercial!: string;

    @Column()
    talla!: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    precio_base_usd!: number;

    @Column('decimal', { precision: 10, scale: 2, default: 0 })
    descuento_mayorista!: number;

    @Column('int', { default: 0 })
    stock_actual!: number;

    @Column()
    imagen_url!: string;

    @Column({ default: true })
    activo!: boolean;
}