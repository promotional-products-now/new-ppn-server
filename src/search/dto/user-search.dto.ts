import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { PaginationDto } from 'src/commons/dtos/pagination.dto';

export class UserSearchDto extends PaginationDto {
  @ApiProperty({
    example: 'John',
    description:
      'The search term can be either the user first name, last name or email address',
  })
  @IsString()
  @IsNotEmpty()
  searchTerm: string;
}
