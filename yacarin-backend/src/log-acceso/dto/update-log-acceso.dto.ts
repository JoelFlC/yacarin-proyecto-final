import { PartialType } from '@nestjs/mapped-types';
import { CreateLogAccesoDto } from './create-log-acceso.dto';

export class UpdateLogAccesoDto extends PartialType(CreateLogAccesoDto) {}
