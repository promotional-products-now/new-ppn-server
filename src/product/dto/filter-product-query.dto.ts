import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class FilterProductQueryDto {
  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsOptional()
  colours: string[];

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  search: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  sort: string;

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsOptional()
  filter: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsOptional()
  vendors: string[];

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  page: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  limit: number;
}
