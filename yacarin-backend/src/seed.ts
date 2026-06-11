import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SeederService } from './seeder/seeder.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const seeder = app.get(SeederService);
  
  try {
    await seeder.seed();
    console.log('Seeder ejecutado con éxito.');
  } catch (error) {
    console.error('El seeder falló:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
