import { IsString, IsUUID, IsNumber, IsNotEmpty, Min } from 'class-validator';

export class CreateRegistroProduccionDto {
    @IsUUID('4', { message: 'El ID de la orden debe ser un UUID válido' })
    @IsNotEmpty()
    orden_id!: string;

    @IsUUID('4', { message: 'El ID del empleado debe ser un UUID válido' })
    @IsNotEmpty()
    empleado_id!: string;

    @IsString()
    @IsNotEmpty()
    tarea_realizada!: string; // Ej: 'COSTURA', 'CORTE'

    @IsNumber()
    @Min(1, { message: 'La cantidad producida debe ser al menos 1' })
    cantidad_producida!: number;
}