import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { User, UserDocument } from '../schemas/user.schema';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { PaginationDto } from 'src/commons/dtos/pagination.dto';

export class FindUsers {
  @ApiProperty({ type: User, isArray: true })
  @IsArray()
  @Type(() => User)
  users: User[];

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
