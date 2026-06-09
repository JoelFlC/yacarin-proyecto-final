import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity';

@Entity('EMPLEADO')
    export class Empleado {
    @PrimaryColumn('uuid')
    usuario_id!: string;

    @OneToOne(() => Usuario)
    @JoinColumn({ name: 'usuario_id' })
    usuario!: Usuario;

    // Utilizamos el tipo jsonb nativo de PostgreSQL
    @Column({ type: 'jsonb' })
    especialidades!: {
        corte: boolean;
        costura: boolean;
        empaque: boolean;
        tejeduria: boolean;
    };
}