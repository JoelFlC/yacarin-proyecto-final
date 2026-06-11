import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity';

@Entity('DIRECCION_ENVIO')
export class DireccionEnvio {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => Usuario)
    @JoinColumn({ name: 'cliente_id' })
    cliente!: Usuario;

    @Column({ type: 'varchar', length: 100 })
    departamento!: string;

    @Column({ type: 'varchar', length: 150 })
    zona!: string;

    @Column({ type: 'varchar', length: 255 })
    calle_numero!: string;

    @Column({ default: true })
    activa!: boolean;
}
