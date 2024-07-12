import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class CountUserResDto {
  @ApiProperty({
    example: 1000,
    description: 'The total number of users in the database',
  })
  @IsNumber()
  totalUsers: number;

  @ApiProperty({
    example: 100,
    description: 'The total number of new users in the database',
  })
  @IsNumber()
  newUsers: number;
}
