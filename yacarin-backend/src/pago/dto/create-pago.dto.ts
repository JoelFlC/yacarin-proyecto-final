import { IsNotEmpty, IsNumber, IsString, IsUUID, Min, IsOptional } from 'class-validator';

export class CreatePagoDto {
    @IsUUID()
    @IsNotEmpty()
    pedido_id!: string;

    @IsNumber()
    @Min(0.01)
    monto_pagado_usd!: number;

    @IsString()
    @IsNotEmpty()
    metodo_pago!: string; // Transferencia, QR, Efectivo

    @IsString()
    @IsNotEmpty()
    tipo_pago!: string; // Abono, Liquidacion, Total

    @IsOptional()
    @IsString()
    concepto?: string;
}
