import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export class CreateUserActivityDto {
  @ApiProperty({
    example: 'order',
    description: 'Activity performed by the current logged in user ',
  })
  @IsString()
  @IsNotEmpty()
  activity: string;

  @ApiProperty({
    example: 'order',
    description:
      'Additional information concerning the activity  performed by the current logged in user. It is an optional field ',
    required: false,
  })
  @IsObject()
  @IsOptional()
  additionalData?: Record<string, any>;
}

export class CreateUserActivityResDto {
  @ApiProperty({ example: '123456789876' })
  @IsString()
  userActivityId: string;
}
