import { IsUUID, IsNotEmpty, IsInt, Min } from 'class-validator';

export class CreateOrdenProduccionDto {
    @IsUUID('4', { message: 'El ID del producto debe ser un UUID válido' })
    @IsNotEmpty({ message: 'Debe especificar el producto a fabricar' })
    producto_id!: string;

    @IsInt({ message: 'La cantidad a fabricar debe ser un número entero' })
    @Min(1, { message: 'La cantidad mínima a fabricar es 1 unidad' })
    cantidad_fabricar!: number;
}