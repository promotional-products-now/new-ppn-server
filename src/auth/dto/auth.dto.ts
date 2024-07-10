import { ApiProperty } from '@nestjs/swagger';
import { Match } from '../../commons/decorators/matches';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsDate,
  IsStrongPassword,
  IsNumber,
} from 'class-validator';
import { UserRole } from '../../user/enums/role.enum';
import { Nationality } from '../../user/enums/nationality.enum';
import { RelationshipType } from '../../user/enums/relationshipType.enum';
import { Location } from '../../user/user.interface';

export class EmailDTO {
  @ApiProperty({
    description: 'User email',
    type: String,
    example: 'imma@gmail.com',
    required: true,
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;
}

export class LoginAuthDto extends EmailDTO {
  @ApiProperty({ example: '12345@Alafin' })
  @IsStrongPassword({
    minLength: 5,
    minUppercase: 1,
    minSymbols: 1,
    minNumbers: 1,
  })
  password: string;
}

export class ValidateUserDto extends EmailDTO {
  @ApiProperty({ example: 123456 })
  @IsString()
  otp: string;
}

export class ChangePasswordDto extends EmailDTO {
  @ApiProperty({ example: '12345@Alafin' })
  @IsStrongPassword({
    minLength: 5,
    minUppercase: 1,
    minSymbols: 1,
    minNumbers: 1,
  })
  password: string;

  @ApiProperty({ example: '12345@Alafin' })
  @Match('password')
  confirmPassword: string;
}
export class SignupAuthDto extends LoginAuthDto {
  @ApiProperty({
    description: 'first name',
    required: true,
    example: 'immanuel',
  })
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty({
    description: 'last name',
    required: true,
    example: 'doe',
  })
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiProperty({ example: '+23490191234567', required: true })
  @IsNotEmpty()
  @IsString()
  phone: string;

  @ApiProperty({ example: '12345@Alafin', required: true })
  @Match('password')
  confirmPassword: string;

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
      postCode: '09494i44',
    },
  })
  @IsOptional()
  location: Location;
}
