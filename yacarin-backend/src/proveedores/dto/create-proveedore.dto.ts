import { IsString, IsNotEmpty } from 'class-validator';

export class CreateProveedorDto {
    @IsString()
    @IsNotEmpty({ message: 'El nombre de la empresa es obligatorio' })
    nombre_empresa!: string;

    @IsString()
    @IsNotEmpty({ message: 'El teléfono de contacto es obligatorio' })
    telefono!: string;
}