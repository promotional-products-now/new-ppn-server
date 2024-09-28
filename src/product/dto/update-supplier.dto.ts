import { IsArray, IsOptional, ValidateNested } from 'class-validator';
import { AdvancedMarkup, BaseUpdateDto } from './update-product.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UdpateSupplierDto extends BaseUpdateDto {
  @ValidateNested()
  @Type(() => AdvancedMarkup)
  @IsOptional()
  advancedMarkup?: AdvancedMarkup;
}

export class UdpateSuppliersDto extends BaseUpdateDto {
  @ApiProperty({ type: 'string', isArray: true })
  @IsArray()
  ids: string[];
}
