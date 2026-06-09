import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
    @IsEmail({}, { message: 'Formato de correo inválido' })
    @IsNotEmpty({ message: 'El correo es obligatorio' })
    email!: string;

    @IsString()
    @IsNotEmpty({ message: 'La contraseña es obligatoria' })
    password!: string;
}