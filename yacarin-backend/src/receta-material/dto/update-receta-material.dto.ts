import { PartialType } from '@nestjs/mapped-types';
import { CreateRecetaMaterialDto } from './create-receta-material.dto';

export class UpdateRecetaMaterialDto extends PartialType(CreateRecetaMaterialDto) {}
