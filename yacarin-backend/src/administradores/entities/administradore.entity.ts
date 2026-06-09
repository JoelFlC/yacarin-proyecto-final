import { Entity, PrimaryColumn, OneToOne, JoinColumn } from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity';

@Entity('ADMINISTRADOR')
export class Administrador {
    @PrimaryColumn('uuid')
    usuario_id!: string;

    @OneToOne(() => Usuario)
    @JoinColumn({ name: 'usuario_id' })
    usuario!: Usuario;
}