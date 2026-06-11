import { Test, TestingModule } from '@nestjs/testing';
import { CompraMaterialService } from './compra-material.service';

describe('CompraMaterialService', () => {
  let service: CompraMaterialService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CompraMaterialService],
    }).compile();

    service = module.get<CompraMaterialService>(CompraMaterialService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
