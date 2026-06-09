import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('MATERIAL')
export class Material {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    nombre!: string;

    @Column()
    unidad_medida!: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    stock_actual!: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    costo_base_usd!: number;

    @Column({ default: true })
    activo!: boolean;
}