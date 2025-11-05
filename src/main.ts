import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.set('trust proxy', 1);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.use(cookieParser());
  app.use(helmet());

  app.enableCors({
    origin: [
      'https://gym-typescript-test.netlify.app',
      'http://localhost:5000',
      'http://localhost:5173',
    ],
    credentials: true,
  });

  app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

  await app.listen(process.env.PORT || 5000);
  console.log(`Server running on port ${process.env.PORT || 5000}`);
}
bootstrap();
