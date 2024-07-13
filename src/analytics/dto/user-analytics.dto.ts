import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsNumber,
  IsObject,
  IsString,
  ValidateNested,
} from 'class-validator';

class UserDto {
  @ApiProperty({
    example: '669272b7a2bbb4ad40b37332',
    description: 'Id of the users',
  })
  @IsString()
  _id: string;

  @ApiProperty({
    example: '669272b7a2bbb4ad40b37332',
    description: 'First name of the users',
  })
  @IsString()
  firstName: string;

  @ApiProperty({
    example: '669272b7a2bbb4ad40b37332',
    description: 'Last name of the users',
  })
  @IsString()
  lastName: string;

  @ApiProperty({
    example: '2024-07-13T12:32:16.858Z',
    description: 'Date string of when the users was created',
  })
  @IsDateString()
  createdAt: string;
}

export class UserAnalytics {
  @ApiProperty({ type: [UserDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UserDto)
  users: UserDto[];
}
