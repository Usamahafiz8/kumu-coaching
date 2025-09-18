import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Configure raw body for Stripe webhooks
  app.use('/stripe/webhook', (req, res, next) => {
    if (req.originalUrl === '/stripe/webhook') {
      req.rawBody = '';
      req.setEncoding('utf8');
      req.on('data', (chunk) => {
        req.rawBody += chunk;
      });
      req.on('end', () => {
        next();
      });
    } else {
      next();
    }
  });

  const configService = app.get(ConfigService);
  const port = configService.get('PORT') || 3000;
  
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
