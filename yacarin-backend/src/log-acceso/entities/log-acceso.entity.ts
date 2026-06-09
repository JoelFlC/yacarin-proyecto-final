import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity';

@Entity('LOG_ACCESO')
export class LogAcceso {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => Usuario)
    @JoinColumn({ name: 'usuario_id' })
    usuario!: Usuario;

    @Column()
    direccion_ip!: string;

    @Column()
    evento!: string; 

    @Column()
    browser!: string;

    @CreateDateColumn() 
    fecha_hora!: Date;
}