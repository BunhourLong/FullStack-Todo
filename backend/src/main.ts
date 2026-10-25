import { NestFactory } from '@nestjs/core';
import { AppModule, ObserveInstrument } from './app.module.js';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  });
  // credentials: the browser must send the refresh cookie cross-origin.
  app.enableCors({ origin: 'http://localhost:5173', credentials: true });
  app.use(cookieParser());
  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe()
  )
  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
