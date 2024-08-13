import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

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

  @ApiProperty({
    example: '66434fbad54cecbd2569b403',
    description: 'The user id to filter by',
    required: false,
  })
  @IsOptional()
  userId?: string;
}
