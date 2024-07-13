import { Document, HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import { PopupPosition } from '../settings.interface';
import { ApiProperty } from '@nestjs/swagger';

@Schema({
  timestamps: true,
  toJSON: {
    transform: function (doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    },
  },
})
export class BannerSetting extends Document {
  @Prop({
    type: {
      isActive: {
        type: Boolean,
        default: false,
      },
      message: {
        type: String,
        default: '',
      },
    },
  })
  @ApiProperty({
    description: 'Banner setting',
    example: {
      isActive: true,
      message: 'you are welcome to promotional product',
    },
  })
  banner: {
    isActive: boolean;
    message: string;
  };

  @Prop({
    type: {
      isActive: {
        type: Boolean,
        default: false,
      },
      image: String,
      message: String,
      urlLink: String,
      position: {
        type: String,
        enum: PopupPosition,
        default: PopupPosition.TOP_CENTER,
      },
    },
  })
  @ApiProperty({
    description: 'Pop-up modal setting',
    example: {
      isActive: true,
      image:
        'https://res.cloudinary.com/dd2yns0fq/image/upload/v1720844756/lxdnb15inxgh5xztvx2s.jpg',
      message: 'Hello Vender',
      urlLink: 'url link',
      position: 'top-center',
    },
  })
  popupModal: {
    isActive: boolean;
    image: string;
    message: string;
    urlLink: string;
    position: string;
  };
}

export type BannerSettingDocument = HydratedDocument<BannerSetting>;

export const BannerSettingSchema = SchemaFactory.createForClass(
  BannerSetting,
).set('versionKey', false);
