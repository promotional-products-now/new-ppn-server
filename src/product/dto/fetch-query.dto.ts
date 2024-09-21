import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class FetchtQueryDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  sort: string;

  @ApiProperty({ example: '1' })
  @Transform(({ value }) => Number(value))
  @IsNumber()
  page: number;

  @ApiProperty({ example: '15' })
  @Transform(({ value }) => Number(value))
  @IsNumber()
  limit: number;

  @ApiProperty({ example: 'search term', required: false })
  @IsString()
  @IsOptional()
  query?: string;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  isActive?: boolean;
}

export class PricingDetailsDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  basePrice: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  additions: string[];
}
