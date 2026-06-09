import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn } from 'typeorm';

@Entity('TIPO_CAMBIO')
export class TipoCambio {
    @PrimaryGeneratedColumn('increment')
    id!: number;

    @Column({ unique: true })
    moneda!: string;

    @Column('decimal', { precision: 10, scale: 2 })
    valor_bs!: number;

    @UpdateDateColumn()
    fecha_actualizacion!: Date;
}