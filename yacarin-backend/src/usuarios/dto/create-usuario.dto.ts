import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUsuarioDto {
    @IsEmail({}, { message: 'El formato del correo electrónico no es válido' })
    @IsNotEmpty({ message: 'El correo es obligatorio' })
    email!: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
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
    @IsOptional() // Como en la BD pusimos nullable: true, aquí decimos que es opcional
    celular?: string;
}