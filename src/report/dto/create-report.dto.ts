import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ReportType } from '../schemas/report.enum';
import { faker } from '@faker-js/faker';

export class CreateReportDto {
  @IsNotEmpty()
  @IsMongoId()
  @ApiProperty({
    description: 'user that is beign reported',
    example: faker.database.mongodbObjectId(),
  })
  reportedUser: string;

  @IsOptional()
  reportedBy: string;

  @ApiProperty({
    description: 'Report type',
    enum: ReportType,
    default: ReportType.Others,
    example: ReportType.Profile,
    required: false,
  })
  @IsOptional()
  reportType: string;

  @ApiProperty({
    description: 'Reson for the report',
    example: faker.lorem.sentence(1),
  })
  @IsOptional()
  @IsString()
  reason: string;

  @ApiProperty({
    description: 'More details of the report',
    example: faker.lorem.paragraphs(3),
  })
  @IsOptional()
  @IsString()
  detail: string;

  @ApiProperty({
    description: 'Additional comments',
    example: faker.lorem.paragraphs(2),
  })
  @IsOptional()
  @IsString()
  comment: string;
}
