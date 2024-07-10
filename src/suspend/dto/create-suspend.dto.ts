import { faker } from '@faker-js/faker';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UnSuspendDto {
  @ApiPropertyOptional({
    description: 'The id of the user to block',
    example: faker.database.mongodbObjectId(),
  })
  @IsString()
  userId: string;
}

export class CreateSuspendDto extends UnSuspendDto {
  @ApiPropertyOptional({
    description: 'The reason for suspending the user',
    example: 'posting nude',
  })
  @IsString()
  reason: string;
}
