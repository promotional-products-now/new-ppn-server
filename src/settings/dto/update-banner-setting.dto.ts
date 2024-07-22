import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PopupPosition } from '../settings.interface';

export class BannerDto {
  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: 'this is a banner test' })
  message: string;
}

export class PopupModalDto {
  isActive: boolean;
  @ApiProperty({
    description: 'Pop-up modal image URL',
    example:
      'https://res.cloudinary.com/dd2yns0fq/image/upload/v1720844756/lxdnb15inxgh5xztvx2s.jpg',
    required: false,
  })
  image: string;
  @ApiProperty({
    description: 'Banner message',
    example: 'you are welcome to promotional product',
    required: false,
  })
  message: string;

  @ApiProperty({
    description: 'Pop-up modal URL link',
    example: 'url link',
    required: false,
  })
  @IsOptional()
  @IsString()
  urlLink: string;

  @ApiProperty({
    description: 'Pop-up modal position',
    example: 'top-center',
    required: false,
  })
  @IsOptional()
  @IsEnum(PopupPosition)
  position: string;
}
export class UpdateBannerSettingDto {
  @ApiProperty({
    description: 'Banner setting',
    example: {
      isActive: true,
      message: 'you are welcome to promotional product',
    },
    required: false,
  })
  @IsOptional()
  banner?: BannerDto;

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
    required: false,
  })
  @IsOptional()
  popupModal?: PopupModalDto;
}
