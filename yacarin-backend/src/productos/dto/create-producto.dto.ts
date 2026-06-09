import { IsString, IsNotEmpty, IsNumber, IsUUID, IsOptional, Min } from 'class-validator';

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

    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0, { message: 'El precio no puede ser negativo' })
    precio_base_usd!: number;

    @IsNumber({ maxDecimalPlaces: 2 })
    @IsOptional()
    descuento_mayorista?: number;

    @IsNumber()
    @Min(0, { message: 'El stock no puede ser negativo' })
    stock_actual!: number;

    @IsString()
    @IsNotEmpty({ message: 'Debe incluir la URL de la imagen del producto' })
    imagen_url!: string;
}