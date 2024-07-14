import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class BaseUpdateDto {
  @ApiProperty({ type: 'boolean', example: true })
  @IsBoolean()
  isActive: boolean;
}

export class UpdateProductDto extends BaseUpdateDto {}

export class UpdateCategoryDto extends BaseUpdateDto {}

export class UpdateSubCategoryDto extends BaseUpdateDto {}

export class UdpateSupplierDto extends BaseUpdateDto {}
