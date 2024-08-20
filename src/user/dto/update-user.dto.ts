import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsArray, IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { UserType } from '../enums/userType.enum';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty({
    description: 'User Type',
    enum: UserType,
    default: UserType.Non_VIP,
  })
  @IsEnum(UserType)
  @IsOptional()
  userType: UserType;
}

export class BanMultipleUsersDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  usersId: string[];
}

export class BanMultipleUsers {
  @ApiProperty({ example: true, description: 'If users has been banned' })
  @IsBoolean()
  bannedUsers: boolean;
}
