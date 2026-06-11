import { IsNotEmpty, IsNumber, IsUUID, Min } from 'class-validator';

export class CreateCompraMaterialDto {
    @IsUUID()
    @IsNotEmpty()
    proveedor_id!: string;

    @IsUUID()
    @IsNotEmpty()
    material_id!: string;

    @IsNumber()
    @Min(0.01)
    cantidad!: number;

    @IsNumber()
    @Min(0)
    precio_compra_usd!: number;
}
