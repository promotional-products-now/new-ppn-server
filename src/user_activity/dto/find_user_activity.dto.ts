import { ApiProperty } from '@nestjs/swagger';
import { PaginationDto } from '../../commons/dtos/pagination.dto';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum UserRole {
  USER = 'user',
  SUPER_Admin = 'super-admin',
  Editor_Admin = 'editor-admin',
  CUSTOMER_CARE_Admin = 'customer-care-admin',
}

class EmailDto {
  @ApiProperty({ example: 'example@gmail.com' })
  @IsEmail()
  address: string;
}

export class UserDto {
  @ApiProperty({ example: '1234567543' })
  @IsString()
  _id: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  lastName: string;

  @ApiProperty({ type: EmailDto })
  @IsObject()
  @Type(() => EmailDto)
  email: EmailDto;

  @ApiProperty({ enum: UserRole })
  @IsEnum(UserRole)
  role: UserRole;
}

export class UserActivityDto {
  @ApiProperty({ example: '1234567543' })
  @IsString()
  activityId: string;

  @ApiProperty({ type: UserDto })
  @IsObject()
  @Type(() => UserDto)
  user: UserDto;

  @ApiProperty({ example: 'signup' })
  @IsString()
  activity: string;

  @ApiProperty({ type: Map, required: false })
  @IsOptional()
  @IsObject()
  additionalData?: Record<string, any>;

  @ApiProperty({ example: '2024-03-08T00:00:00Z' })
  @IsDateString()
  createdAt: Date;

  @ApiProperty({ example: '2024-03-08T00:00:00Z' })
  @IsDateString()
  updatedAt: Date;
}

export class FindUserActivity {
  @ApiProperty({ type: UserActivityDto, isArray: true })
  @IsArray()
  @Type(() => UserActivityDto)
  activities: UserActivityDto[];

  @ApiProperty({ example: true, description: 'Is there a previous page?' })
  @IsBoolean()
  hasPrevious: boolean;

  @ApiProperty({ example: true, description: 'Is there a next page?' })
  @IsBoolean()
  hasNext: boolean;

  @ApiProperty({ example: 1, description: 'The next page number' })
  @IsNumber()
  nextPage: number;

  @ApiProperty({ example: 0, description: 'The pervious page number' })
  @IsNumber()
  prevPage: number;
  @ApiProperty({ example: 5, description: 'The total number of pages' })
  @IsNumber()
  totalPages: number;
}

export class FilterWithCreatedAt extends PaginationDto {
  @ApiProperty({ required: false, example: '2024-07-20' })
  @IsDateString()
  @IsOptional()
  startDate: string;

  @ApiProperty({ required: false, example: '2024-07-20' })
  @IsDateString()
  @IsOptional()
  endDate: string;
}

export class UserActivitySearchDto extends PaginationDto {
  @ApiProperty({
    example: 'john',
    description: 'The user you are searching for',
  })
  @IsString()
  @IsNotEmpty()
  searchTerm: string;

  @ApiProperty({ required: false, example: '2024-07-20' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ required: false, example: '2024-07-20' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
