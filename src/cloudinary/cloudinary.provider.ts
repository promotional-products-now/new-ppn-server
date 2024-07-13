import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';
import { CLOUDINARY } from './constants';
import { CloudinaryConfig } from '../configs';

export const CloudinaryProvider = {
  provide: CLOUDINARY,
  useFactory: async (
    configService: ConfigService,
  ): Promise<ReturnType<typeof cloudinary.config>> => {
    const cloudinarySecrets = configService.get<CloudinaryConfig>('cloudinary');

    return cloudinary.config({
      cloud_name: cloudinarySecrets.cloudName,
      api_key: cloudinarySecrets.apiKey,
      api_secret: cloudinarySecrets.apiSecret,
    });
  },
  inject: [ConfigService],
};
