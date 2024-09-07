import { Module } from '@nestjs/common';
import { AdvertService } from './advert.service';
import { AdvertController } from './advert.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Advert, AdvertSchema } from './schemas/advert.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Advert.name, schema: AdvertSchema }]),
  ],
  controllers: [AdvertController],
  providers: [AdvertService],
})
export class AdvertModule {}
