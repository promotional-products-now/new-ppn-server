import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConsoleLogger, ValidationPipe, VersioningType } from '@nestjs/common';
import { AppModule } from './app.module';
import { TrimPipe } from './commons/pipes/trimmer.pipe';
// import { AllExceptionsFilter } from './commons/filters/all-exceptions.filter';
import * as cookieParser from 'cookie-parser';
import { AppConfig, sendGrid, sessionKey } from './configs';
import * as compression from 'compression';
import helmet from 'helmet';
const ip = require('ip');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(helmet());

  app.useGlobalPipes(new TrimPipe());

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.use(compression());

  const configService = app.get(ConfigService);
  const port = configService.get<number>('port');
  const sessionKey = configService.get<sessionKey>('sessionKey');
  const appEnv = configService.getOrThrow<string>('appEnv');

  app.enableCors({
    origin: [
      'https://promotionalproductsnow.au',
      'http://promotionalproductsnow.au',
      'https://app.promotionalproductsnow.au',
      'http://app.promotionalproductsnow.au',
      appEnv === 'development' && 'http://localhost:5173',
      appEnv === 'development' && 'http://localhost:3000',
    ],
    methods: '*',
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Uid', 'x-uid', 'uid'],
  });

  /**
   * See [Versioning and Swagger](https://github.com/nestjs/swagger/issues/1495#issuecomment-898311614)
   */
  app.enableVersioning({
    type: VersioningType.URI,
    prefix: 'v',
    defaultVersion: '1',
  });

  app.use(cookieParser(sessionKey.session_secret));

  app.setGlobalPrefix('api');

  // Configuring Swagger
  const config = new DocumentBuilder()
    .setTitle('ppn')
    .setDescription('The ppn API description')
    .setVersion('1.0')
    .addBearerAuth()
    .addSecurity('uid', {
      type: 'apiKey',
      name: 'x-uid',
      in: 'header',
    })
    .build();

  const document = SwaggerModule.createDocument(app, config);

  //TODO: disable the swagger docs on production
  SwaggerModule.setup('/v1/api-docs', app, document);

  const httpAdapter = app.get(HttpAdapterHost);

  // app.useGlobalFilters(
  //   new AllExceptionsFilter(httpAdapter, new ConsoleLogger()),
  // );

  // const logger = app.get(Logger);

  // app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost, logger));

  await app.listen(port);

  console.log('\x1b[44m%s\x1b[0m', 'info', 'ppn API Server Started');

  console.info(
    '\x1b[44m%s\x1b[0m',
    'info',
    'ppn Service',
    `http://localhost:${port}`,
  );

  console.info(
    '\x1b[44m%s\x1b[0m',
    'info',
    'ppn Documentation',
    `http://localhost:${port}/v1/api-docs`,
  );
  console.log('ip.address : ', ip.address());

  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
