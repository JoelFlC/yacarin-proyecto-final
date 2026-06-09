import { IsNotEmpty, IsNumber, IsUUID, Min } from 'class-validator';

export class CreateRecetaMaterialDto {
    @IsUUID('4', { message: 'El ID del producto debe ser un UUID válido' })
    @IsNotEmpty()
    producto_id!: string;

    @IsUUID('4', { message: 'El ID del material debe ser un UUID válido' })
    @IsNotEmpty()
    material_id!: string;

    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0.01, { message: 'La cantidad requerida debe ser mayor a cero' })
    cantidad_requerida!: number;
}