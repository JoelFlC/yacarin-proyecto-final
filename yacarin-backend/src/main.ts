import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Habilitamos CORS para que el frontend pueda conectarse
  app.enableCors({
    origin: '*', // En producción cambiaremos esto por la URL de Vercel
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  });

  // Activamos la validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Ignora datos basura que mande el frontend (ej: si mandan un campo "hack")
      forbidNonWhitelisted: true, // Lanza error si mandan datos que no esperamos
      transform: true, // Transforma los tipos de datos (ej: de String a Number automáticamente)
    })
  );

  await app.listen(3000);
  console.log(`Aplicación corriendo en: http://localhost:3000`);
}
bootstrap();