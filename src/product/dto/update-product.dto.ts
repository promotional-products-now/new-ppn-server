import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum } from 'class-validator';
import { STATUS_ENUM } from '../product.interface';

export class BaseUpdateDto {
  @ApiProperty({ type: 'boolean', example: true })
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({
    type: 'string',
    enum: STATUS_ENUM,
    example: STATUS_ENUM.BUY_NOW,
  })
  @IsEnum(STATUS_ENUM)
  status: STATUS_ENUM;
}

export class UpdateProductDto extends BaseUpdateDto {}

export class UpdateCategoryDto extends BaseUpdateDto {}

export class UpdateSubCategoryDto extends BaseUpdateDto {}

export class UdpateSupplierDto extends BaseUpdateDto {}
