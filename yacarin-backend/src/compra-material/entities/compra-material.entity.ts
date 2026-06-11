import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Proveedor } from '../../proveedores/entities/proveedore.entity';
import { Material } from '../../materiales/entities/materiale.entity';
import { TipoCambio } from '../../tipo-cambio/entities/tipo-cambio.entity';

@Entity('COMPRA_MATERIAL')
export class CompraMaterial {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => Proveedor)
    @JoinColumn({ name: 'proveedor_id' })
    proveedor!: Proveedor;

    @ManyToOne(() => Material)
    @JoinColumn({ name: 'material_id' })
    material!: Material;

    @ManyToOne(() => TipoCambio)
    @JoinColumn({ name: 'tipo_cambio_id' })
    tipo_cambio!: TipoCambio;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    cantidad!: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    precio_compra_usd!: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    precio_compra_bs!: number;

    @CreateDateColumn()
    fecha_compra!: Date;
}
