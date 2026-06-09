import { IsString, IsNumber, IsPositive, IsNotEmpty } from 'class-validator';

export class CreateTipoCambioDto {
    @IsString()
    @IsNotEmpty({ message: 'La moneda es obligatoria (ej. USD)' })
    moneda!: string;

    @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El valor debe ser un número con máximo 2 decimales' })
    @IsPositive({ message: 'El valor de cambio debe ser positivo' })
    valor_bs!: number;
}