import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('PROVEEDOR')
export class Proveedor {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    nombre_empresa!: string;

    @Column()
    telefono!: string;

    @Column({ default: true })
    activo!: boolean;
}