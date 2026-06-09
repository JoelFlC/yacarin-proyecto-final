import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('TARIFA_PRODUCCION')
export class TarifaProduccion {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar', length: 50, unique: true })
    tarea!: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    precio_bs!: number;
}