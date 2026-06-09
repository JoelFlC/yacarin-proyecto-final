import { IsArray, IsNotEmpty, IsNumber, IsString, ValidateNested, Min, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

// DTO interno para validar cada producto del carrito
class ItemPedidoDto {
    @IsString()
    @IsUUID('4', { message: 'El formato del ID del producto es inválido' })
    @IsNotEmpty({ message: 'El ID del producto es obligatorio' })
    producto_id!: string;

    @IsNumber()
    @Min(1, { message: 'La cantidad mínima es 1' })
    cantidad!: number;
    }

    // DTO principal
    export class CreatePedidoDto {
    @IsString()
    @IsNotEmpty({ message: 'La dirección de envío es obligatoria' })
    direccion_envio!: string;

    @IsArray()
    @ValidateNested({ each: true }) 
    @Type(() => ItemPedidoDto) 
    items!: ItemPedidoDto[];
}