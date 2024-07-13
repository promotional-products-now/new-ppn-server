import { Module } from '@nestjs/common';
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

@Module({
  imports: [
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
    ]),
  ],
  controllers: [SettingsController],
  providers: [SettingsService, CloudinaryService],
})
export class SettingsModule {}
