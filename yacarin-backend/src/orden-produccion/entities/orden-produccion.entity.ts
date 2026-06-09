import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Producto } from '../../productos/entities/producto.entity';
import { OrdenMaterial } from './orden-material.entity';

@Entity('ORDEN_PRODUCCION')
export class OrdenProduccion {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => Producto)
    @JoinColumn({ name: 'producto_id' })
    producto!: Producto;

    @Column({ type: 'int' })
    cantidad_fabricar!: number;

    @Column({ default: 'EN_PROCESO' }) // EN_PROCESO, COMPLETADA, CANCELADA
    estado!: string;

    @CreateDateColumn()
    fecha_inicio!: Date;

    @UpdateDateColumn()
    fecha_actualizacion!: Date;

    // Relación hacia los materiales consumidos
    @OneToMany(() => OrdenMaterial, detalle => detalle.ordenProduccion, { cascade: true })
    materiales_consumidos!: OrdenMaterial[];
}