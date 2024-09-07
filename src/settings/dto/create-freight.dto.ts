import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateIf,
} from 'class-validator';
import { DestinationType, FreightType } from '../settings.interface';

export class CreateFreightDto {
  @ApiProperty()
  @IsString()
  supplier: string;

  @ApiProperty({ enum: FreightType, default: FreightType.FIX })
  @IsEnum(FreightType)
  type: FreightType;

  @ApiProperty({ required: false })
  @ValidateIf((o) => o.type === FreightType.FIX)
  @IsNotEmpty()
  freightPrice: number;

  @ApiProperty({ enum: DestinationType, default: DestinationType.METROPOLITAN })
  @IsEnum(DestinationType)
  destinationType: DestinationType;

  @ApiProperty({ type: [Number] })
  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  destinations: number[];
}
