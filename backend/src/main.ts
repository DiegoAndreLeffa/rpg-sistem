import 'reflect-metadata';

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DEFAULT_WS_NAMESPACE, PROJECT_NAME } from '@rpg/shared';

async function bootstrap(): Promise<void> {
  console.log("URI do Banco:", process.env.MONGO_URI);
  const app = await NestFactory.create(AppModule);
  const defaultOrigins = [
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    'http://localhost:5173',
    'http://localhost:5174'
  ];
  const configuredOrigins = (process.env.CORS_ORIGIN ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true
    })
  );
  app.enableCors({
    origin: configuredOrigins.length > 0 ? configuredOrigins : defaultOrigins
  });

  const port = Number(process.env.PORT ?? 3001);

  await app.listen(port);
  console.log(`${PROJECT_NAME} backend running on port ${port} (${DEFAULT_WS_NAMESPACE})`);
}

void bootstrap();
