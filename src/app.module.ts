import { APP_GUARD } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { ConfigInitModule } from './commons/modules/config.module';
import { MongoModule } from './commons/modules/mongo.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { SuspendModule } from './suspend/suspend.module';
import { ReportModule } from './report/report.module';
import { ProductModule } from './product/product.module';
import { SettingsModule } from './settings/settings.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { DataExportModule } from './data_export/data_export.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { SearchModule } from './search/search.module';
import { ProductCategoryModule } from './product-category/product-category.module';

@Module({
  imports: [
    ConfigInitModule,
    MongoModule,
    UserModule,
    AuthModule,
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 5,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 50, //50 request per minute
      },
    ]),
    SuspendModule,
    ReportModule,
    ProductModule,
    SettingsModule,
    CloudinaryModule,
    DataExportModule,
    AnalyticsModule,
    SearchModule,
    ProductCategoryModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
