import { Controller, Get, Post, Body, Param, Delete, UseGuards, Patch, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductosService } from './productos.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Controller('productos')
export class ProductosController {
  constructor(
    private readonly productosService: ProductosService,
    private readonly cloudinaryService: CloudinaryService
  ) { }

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(FileInterceptor('imagen'))
  async create(
    @Body() createProductoDto: CreateProductoDto,
    @UploadedFile() file?: Express.Multer.File
  ) {
    if (file) {
      try {
        const uploadResult = await this.cloudinaryService.subirImagen(file);
        createProductoDto.imagen_url = uploadResult.secure_url;
      } catch (error) {
        throw new BadRequestException('Error al subir la imagen a Cloudinary');
      }
    }
    return this.productosService.create(createProductoDto);
  }

  @Get()
  findAll() {
    return this.productosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productosService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productosService.remove(id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('imagen'))
  async update(
    @Param('id') id: string,
    @Body() updateProductoDto: UpdateProductoDto,
    @UploadedFile() file?: Express.Multer.File
  ) {
    if (file) {
      try {
        const uploadResult = await this.cloudinaryService.subirImagen(file);
        updateProductoDto.imagen_url = uploadResult.secure_url;
      } catch (error) {
        throw new BadRequestException('Error al subir la imagen a Cloudinary');
      }
    }
    return this.productosService.update(id, updateProductoDto);
  }
}