import { forwardRef, Module } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { SettingsController } from './settings.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  BannerSetting,
  BannerSettingSchema,
} from './schemas/banner-setting.schema';
import {
  ProfitSetting,
  ProfitSettingSchema,
} from './schemas/profit-setting.schema';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Freight, FreightSchema } from './schemas/freight.schema';
import { Supplier, SupplierSchema } from '../product/schemas/supplier.schema';
import { JWTModule } from '../commons/services/JWTService/JWTService.module';
import { AuthorizationGuard } from '../commons/guards/authorization.guard';
import { UserModule } from '../user/user.module';
import {
  PurchaseSetting,
  PurchaseSettingSchema,
} from './schemas/purchase-setting.schema';

@Module({
  imports: [
    JWTModule,
    MongooseModule.forFeature([
      {
        name: BannerSetting.name,
        schema: BannerSettingSchema,
      },
      {
        name: ProfitSetting.name,
        schema: ProfitSettingSchema,
      },
      {
        name: Freight.name,
        schema: FreightSchema,
      },
      {
        name: Supplier.name,
        schema: SupplierSchema,
      },
      {
        name: PurchaseSetting.name,
        schema: PurchaseSettingSchema,
      },
    ]),
    forwardRef(() => UserModule),
  ],
  controllers: [SettingsController],
  providers: [SettingsService, CloudinaryService, AuthorizationGuard],
})
export class SettingsModule {}
