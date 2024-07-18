import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsString, Validate } from 'class-validator';

export class BulkEmailRequestDto {
  @ApiProperty({
    type: [String],
    description: 'recipients the email will be sent to',
  })
  @IsArray()
  @Type(() => String)
  recipients: string[];

  @ApiProperty({ example: 'Alert!!', description: 'The subject of the email' })
  @IsString()
  subject: string;

  @ApiProperty({
    example: 'This is a message for all users',
    description: 'The message to be sent out',
  })
  @IsString()
  content: string;

  @ApiProperty({
    example: 'Test',
    description: 'This is the title for the email',
  })
  @IsString()
  title: string;
}
