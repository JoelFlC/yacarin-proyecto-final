import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Producto } from '../../productos/entities/producto.entity';

@Entity('DISEÑO')
export class Diseno {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    nombre_patron!: string;

    @Column('text')
    descripcion_tecnica!: string;

    @Column()
    color_primario!: string;

    @Column({ nullable: true })
    color_secundario!: string;

    @Column({ default: true })
    activo!: boolean;

    // Relación: Un Diseño tiene Muchos Productos
    @OneToMany(() => Producto, (producto) => producto.diseno)
    productos!: Producto[];
}