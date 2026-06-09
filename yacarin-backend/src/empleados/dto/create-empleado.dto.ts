import { IsEmail, IsNotEmpty, IsString, MinLength, IsArray, IsOptional, IsObject } from 'class-validator';

export class CreateEmpleadoDto {
    @IsEmail({}, { message: 'Debe ser un correo electrónico válido' })
    email!: string;

    @IsString()
    @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
    password!: string;

    @IsString()
    @IsNotEmpty({ message: 'El nombre es obligatorio' })
    nombre!: string;

    @IsString()
    @IsNotEmpty({ message: 'El apellido paterno es obligatorio' })
    apPat!: string;

    @IsString()
    @IsNotEmpty({ message: 'El apellido materno es obligatorio' })
    apMat!: string;

    @IsString()
    @IsNotEmpty({ message: 'El número de celular es obligatorio' })
    celular!: string;

    @IsObject()
    @IsOptional()
    especialidades?: {
        corte: boolean;
        costura: boolean;
        empaque: boolean;
        tejeduria: boolean;
    };
}