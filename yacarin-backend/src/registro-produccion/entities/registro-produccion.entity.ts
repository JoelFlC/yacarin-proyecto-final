import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { OrdenProduccion } from '../../orden-produccion/entities/orden-produccion.entity';
import { Empleado } from '../../empleados/entities/empleado.entity';

@Entity('REGISTRO_PRODUCCION')
export class RegistroProduccion {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    // Relación con la Orden que se está trabajando
    @ManyToOne(() => OrdenProduccion)
    @JoinColumn({ name: 'orden_id' })
    orden!: OrdenProduccion;

    // Relación con el Empleado que hizo el trabajo
    @ManyToOne(() => Empleado)
    @JoinColumn({ name: 'empleado_id' })
    empleado!: Empleado;

    @Column({ type: 'varchar', length: 50 })
    tarea_realizada!: string;

    @Column({ type: 'int' })
    cantidad_producida!: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    tarifa_unidad!: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    total_a_pagar!: number;

    @Column({ type: 'varchar', length: 20, default: 'PENDIENTE' })
    estado_pago!: string;
}