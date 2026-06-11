import { Test, TestingModule } from '@nestjs/testing';
import { DireccionEnvioController } from './direccion-envio.controller';

describe('DireccionEnvioController', () => {
  let controller: DireccionEnvioController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DireccionEnvioController],
    }).compile();

    controller = module.get<DireccionEnvioController>(DireccionEnvioController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
