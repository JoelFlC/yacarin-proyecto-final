import { Injectable } from '@nestjs/common';
import { CreateAdministradoreDto } from './dto/create-administradore.dto';
import { UpdateAdministradoreDto } from './dto/update-administradore.dto';

@Injectable()
export class AdministradoresService {
  create(createAdministradoreDto: CreateAdministradoreDto) {
    return 'This action adds a new administradore';
  }

  findAll() {
    return `This action returns all administradores`;
  }

  findOne(id: number) {
    return `This action returns a #${id} administradore`;
  }

  update(id: number, updateAdministradoreDto: UpdateAdministradoreDto) {
    return `This action updates a #${id} administradore`;
  }

  remove(id: number) {
    return `This action removes a #${id} administradore`;
  }
}
