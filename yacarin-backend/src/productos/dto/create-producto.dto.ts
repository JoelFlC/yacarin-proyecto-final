import { IsString, IsNotEmpty, IsNumber, IsUUID, IsOptional, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateProductoDto {
    @IsUUID('4', { message: 'El ID del diseño debe ser un UUID válido' })
    @IsNotEmpty({ message: 'Debe enlazar este producto a un diseño existente' })
    diseno_id!: string;

    @IsString()
    @IsNotEmpty({ message: 'El nombre comercial es obligatorio' })
    nombre_comercial!: string;

    @IsString()
    @IsNotEmpty({ message: 'La talla es obligatoria' })
    talla!: string;

    @Transform(({ value }) => { const val = parseFloat(value); return isNaN(val) ? value : val; })
    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0, { message: 'El precio no puede ser negativo' })
    precio_base_usd!: number;

    @Transform(({ value }) => { const val = parseFloat(value); return isNaN(val) ? value : val; })
    @IsNumber({ maxDecimalPlaces: 2 })
    @IsOptional()
    @Min(0, { message: 'El descuento no puede ser negativo' })
    descuento_mayorista?: number;

    @Transform(({ value }) => { const val = parseInt(value, 10); return isNaN(val) ? value : val; })
    @IsOptional()
    @IsNumber()
    @Min(0, { message: 'El stock no puede ser negativo' })
    stock_actual?: number;

    @IsOptional()
    @IsString()
    imagen_url?: string;

    @IsOptional()
    imagen?: any; // Para evitar el error forbidNonWhitelisted de Multer

    @IsOptional()
    @IsString()
    receta_json?: string; // Para recibir la receta desde FormData
}