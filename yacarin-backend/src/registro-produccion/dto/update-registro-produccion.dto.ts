import { PartialType } from '@nestjs/mapped-types';
import { CreateRegistroProduccionDto } from './create-registro-produccion.dto';

export class UpdateRegistroProduccionDto extends PartialType(CreateRegistroProduccionDto) {}
