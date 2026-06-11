import { IsNotEmpty, IsString } from 'class-validator';

export class CreateDireccionEnvioDto {
    @IsString()
    @IsNotEmpty()
    departamento!: string;

    @IsString()
    @IsNotEmpty()
    zona!: string;

    @IsString()
    @IsNotEmpty()
    calle_numero!: string;
}
