import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class UpdatePurchaseSettingDto {
  @ApiProperty({ type: 'number', example: 300000 })
  @IsNumber()
  defaultQuotationRequest: number;

  @ApiProperty({
    type: 'string',
    example:
      'Your order substantial. Please request a quote for us to offer a more suitable price on your order',
  })
  @IsString()
  largeOrderQuotationRequest: string;
}
