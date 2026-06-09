import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateDisenoDto {
    @IsString()
    @IsNotEmpty({ message: 'El nombre del patrón es obligatorio' })
    nombre_patron!: string;

    @IsString()
    @IsNotEmpty({ message: 'La descripción técnica es obligatoria' })
    descripcion_tecnica!: string;

    @IsString()
    @IsNotEmpty({ message: 'El color primario es obligatorio' })
    color_primario!: string;

    @IsString()
    @IsOptional()
    color_secundario?: string;
}