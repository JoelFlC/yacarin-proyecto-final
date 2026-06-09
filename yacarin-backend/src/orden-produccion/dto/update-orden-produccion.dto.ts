import { PartialType } from '@nestjs/mapped-types';
import { CreateOrdenProduccionDto } from './create-orden-produccion.dto';

export class UpdateOrdenProduccionDto extends PartialType(CreateOrdenProduccionDto) {}
