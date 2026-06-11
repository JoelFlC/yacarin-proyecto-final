import { Test, TestingModule } from '@nestjs/testing';
import { CompraMaterialController } from './compra-material.controller';

describe('CompraMaterialController', () => {
  let controller: CompraMaterialController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompraMaterialController],
    }).compile();

    controller = module.get<CompraMaterialController>(CompraMaterialController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
