import {
  IsDate,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { SignupAuthDto } from '../../auth/dto/auth.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../enums/role.enum';
import { Nationality } from '../enums/nationality.enum';
import { RelationshipType } from '../enums/relationshipType.enum';
import { Location } from '../user.interface';

export class CreateUserDto extends SignupAuthDto {
  @ApiProperty({
    description: 'Gender',
    required: false,
    example: 'male',
  })
  @IsOptional()
  @IsString()
  gender: string;

  @ApiProperty({
    description: 'One Time Password',
    required: false,
    example: '123456',
  })
  @IsOptional()
  @IsString()
  otp: string;

  @ApiProperty({
    description: 'User role',
    enum: UserRole,
    default: UserRole.USER,
    example: UserRole.USER,
    required: false,
  })
  @IsEnum(UserRole)
  @IsOptional()
  role: UserRole;

  @ApiProperty({
    description: 'Church affiliation',
    required: false,
    example: 'First Baptist Church',
  })
  @IsOptional()
  @IsString()
  church: string;

  @ApiProperty({
    description: 'About the user',
    required: false,
    example: 'I am a software developer who loves coding and helping others.',
  })
  @IsOptional()
  @IsString()
  about: string;

  @ApiProperty({
    description: 'Nationality',
    enum: Nationality,
    example: Nationality.NIGERIA,
    required: false,
  })
  @IsEnum(Nationality)
  @IsOptional()
  nationality: Nationality;

  @ApiProperty({
    description: 'Ethnicity',
    required: false,
    example: 'African',
  })
  @IsOptional()
  @IsString()
  ethnicity: string;

  @ApiProperty({
    description: 'Height',
    required: false,
    example: '6 ft',
  })
  @IsOptional()
  @IsString()
  height: string;

  @ApiProperty({
    description: 'Relationship type',
    enum: RelationshipType,
    default: RelationshipType.Marriage,
    example: RelationshipType.Marriage,
    required: false,
  })
  @IsEnum(RelationshipType)
  @IsOptional()
  relationshipType: RelationshipType;

  @ApiProperty({
    description: 'Date of Birth',
    type: String,
    format: 'date-time',
    example: '1999-01-01',
    required: false,
  })
  @IsNotEmpty()
  @IsDateString()
  dob: Date;

  @ApiProperty({
    description: 'Location',
    type: Object,
    required: false,
    example: {
      address: '123 Main St',
      city: 'Lagos',
      state: 'Lagos',
      country: 'Nigeria',
      timeZone: 'West Africa Time',
    },
  })
  location: Location;
}

export class CreateUserDevice {
  @ApiPropertyOptional({
    description: 'The type of the device',
    example: 'Smartphone',
  })
  @IsString()
  @IsOptional()
  type?: string;

  @ApiPropertyOptional({
    description: 'The model of the device',
    example: 'iPhone 13',
  })
  @IsString()
  @IsOptional()
  model?: string;

  @ApiPropertyOptional({
    description: 'The operating system of the device',
    example: 'iOS 15',
  })
  @IsString()
  @IsOptional()
  os?: string;

  @ApiPropertyOptional({
    description: 'The serial number of the device',
    example: 'SN1234567890',
  })
  @IsString()
  @IsOptional()
  serialNumber?: string;

  @ApiPropertyOptional({
    description: 'The manufacturer of the device',
    example: 'Apple',
  })
  @IsString()
  @IsOptional()
  manufacturer?: string;
}

export class singleImageUploadDTO {
  @ApiPropertyOptional({
    description: 'image position, count starts from 0',
    example: '1',
  })
  @IsNumber()
  imagePosition: number;
}
