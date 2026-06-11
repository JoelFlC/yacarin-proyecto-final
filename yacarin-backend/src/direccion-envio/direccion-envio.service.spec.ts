import { Test, TestingModule } from '@nestjs/testing';
import { DireccionEnvioService } from './direccion-envio.service';

describe('DireccionEnvioService', () => {
  let service: DireccionEnvioService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DireccionEnvioService],
    }).compile();

    service = module.get<DireccionEnvioService>(DireccionEnvioService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
