import { Entity, Column, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { Producto } from '../../productos/entities/producto.entity';
import { Material } from '../../materiales/entities/materiale.entity';

@Entity('RECETA_MATERIAL')
export class RecetaMaterial {

    @PrimaryColumn('uuid')
    producto_id!: string;

    @PrimaryColumn('uuid')
    material_id!: string;

    @Column('decimal', { precision: 10, scale: 2 })
    cantidad_requerida!: number;

    @ManyToOne(() => Producto)
    @JoinColumn({ name: 'producto_id' })
    producto!: Producto;

    @ManyToOne(() => Material)
    @JoinColumn({ name: 'material_id' })
    material!: Material;
}