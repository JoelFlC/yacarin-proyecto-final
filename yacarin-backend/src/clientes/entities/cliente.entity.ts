import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity';

@Entity('CLIENTE')
export class Cliente {
    @PrimaryColumn('uuid')
    usuario_id!: string;
    // relacion con usuario
    @OneToOne(() => Usuario)
    @JoinColumn({ name: 'usuario_id' }) 
    usuario!: Usuario;
    @Column()
    tipo_cliente!: string; 
    @Column({ default: 0 })
    puntos_fidelidad!: number;
    @Column({ nullable: true })
    nit!: string;
    @Column({ nullable: true })
    razon_social!: string;
}