import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('USUARIO') // Nombramos la tabla en mayúsculas respetando tu diseño físico
export class Usuario {
    @PrimaryGeneratedColumn('uuid')
    id!: string;
    @Column({ unique: true })
    email!: string;
    @Column()
    password_hash!: string;
    @Column()
    nombre!: string;
    @Column()
    apPat!: string;
    @Column()
    apMat!: string;
    @Column({ nullable: true })
    celular!: string;

    @Column({ type: 'varchar', nullable: true })
    reset_password_token!: string;

    @Column({ type: 'timestamp', nullable: true })
    reset_password_expires!: Date;

    @Column({ default: true }) // Requisito de evaluación: Eliminación lógica
    activo!: boolean;
}