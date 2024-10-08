import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class FetchSupplierstQueryDto {
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
}
