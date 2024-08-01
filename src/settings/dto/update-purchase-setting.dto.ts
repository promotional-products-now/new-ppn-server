import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { BuyNowCandidateStatus } from '../settings.interface';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePurchaseSettingDto {
  @IsString()
  @IsEnum(BuyNowCandidateStatus)
  @ApiProperty({
    description: 'Default buy now candidate status',
    example: BuyNowCandidateStatus.ENABLED,
  })
  @IsOptional()
  defaultBuyNowCandidateStatus: string;

  @IsNumber()
  @Min(1)
  @ApiProperty({
    description: 'Default quotation request',
    example: 30000,
  })
  @IsOptional()
  defaultQuotationRequest: number;

  @IsString()
  @ApiProperty({
    description: 'Large order quotation request',
    example:
      "Your order appears substantial. Please request a quote from us to offer a more suitable price on your order'",
  })
  @IsOptional()
  largeOrderQuotationRequest: string;
}
