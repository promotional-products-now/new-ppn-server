import { IsDateString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AnalyticsDto {
  @ApiProperty({
    example: '2024-07-08',
    description: 'The date to start with',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  startDate: string;

  @ApiProperty({
    example: '2024-07-13',
    description: 'The date to end with',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  endDate: string;
}
