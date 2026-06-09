import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CreateMaterialDto {
    @IsString()
    @IsNotEmpty({ message: 'El nombre del material es obligatorio' })
    nombre!: string;

    @IsString()
    @IsNotEmpty({ message: 'La unidad de medida es obligatoria (ej. metros, kg)' })
    unidad_medida!: string;

    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0, { message: 'El stock no puede ser negativo' })
    stock_actual!: number;

    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0, { message: 'El costo no puede ser negativo' })
    costo_base_usd!: number;
}