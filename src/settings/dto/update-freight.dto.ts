import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  ValidateIf,
} from 'class-validator';
import { DestinationType, FreightType } from '../settings.interface';

export class FreightIdsDto {
  @ApiProperty({
    description: 'Array of freight IDs to delete',
    example: ['605c5e8f5311234567890abc', '605c5e8f5311234567890def'],
    type: [String],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsMongoId({ each: true })
  ids: string[];
}

export class UpdateFreightDto extends FreightIdsDto {
  @ApiProperty({ enum: FreightType, default: FreightType.FIX })
  @IsEnum(FreightType)
  type: FreightType;

  @ApiProperty({ required: false })
  @ValidateIf((o) => o.type === FreightType.FIX)
  @IsNotEmpty()
  @IsOptional()
  freightPrice: number;

  @ApiProperty({
    enum: DestinationType,
    default: DestinationType.UN_CONDITIONAL,
  })
  @IsEnum(DestinationType)
  destinationType: DestinationType;

  @ApiProperty({ type: [Number] })
  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  destinations: number[];
}
