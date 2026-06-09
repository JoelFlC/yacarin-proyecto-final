import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { OrdenProduccion } from './orden-produccion.entity';
import { Material } from '../../materiales/entities/materiale.entity';

@Entity('ORDEN_MATERIAL')
export class OrdenMaterial {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => OrdenProduccion, orden => orden.materiales_consumidos, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'orden_produccion_id' })
    ordenProduccion!: OrdenProduccion;

    @ManyToOne(() => Material)
    @JoinColumn({ name: 'material_id' })
    material!: Material;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    cantidad_consumida!: number; // Ej: 25.5 metros de tela
}