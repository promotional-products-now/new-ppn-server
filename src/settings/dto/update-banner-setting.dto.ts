import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';

class BannerSetting {
  [x: string]: any;
  @ApiProperty()
  @IsBoolean()
  isActive: boolean;

  @ApiProperty()
  @IsString()
  message: string;
}

class PopUpModalSetting {
  @ApiProperty()
  @IsBoolean()
  isActive: boolean;

  @ApiProperty()
  @IsString()
  message: string;

  @ApiProperty()
  @IsString()
  position: string;

  @ApiProperty()
  @IsString()
  urlLink: string;
}

export class UpdateBannerSettingDto {
  @ApiProperty()
  @ValidateNested()
  banner: BannerSetting;

  @ApiProperty()
  @ValidateNested()
  popupModal: PopUpModalSetting;
}
