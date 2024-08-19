import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsArray, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateUserDto extends PartialType(CreateUserDto) {}

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

export class LogoutUser {
  @ApiProperty({ example: 'Logout successful' })
  message: string;
}
