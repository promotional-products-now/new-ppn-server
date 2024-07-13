import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsNumberString, IsOptional } from 'class-validator';

export class PaginationDto {
  @ApiProperty({
    example: 0,
    description: 'Page number to fetch from',
    required: false,
  })
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  @IsOptional()
  page?: number;

  @ApiProperty({
    example: 0,
    description: ' Number of users to fetch from the database',
    required: false,
  })
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  @IsOptional()
  limit?: number;
}
