import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
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
}