import { Document, HydratedDocument } from 'mongoose';
import { Prop, SchemaFactory, Schema } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { BuyNowCandidateStatus } from '../settings.interface';

@Schema({
  timestamps: true,
  versionKey: false,
})
export class PurchaseSetting extends Document {
  @Prop({
    type: String,
    enum: BuyNowCandidateStatus,
    default: BuyNowCandidateStatus.ENABLED,
  })
  @ApiProperty({
    description: 'Default buy now candidate status',
    example: BuyNowCandidateStatus.ENABLED,
  })
  defaultBuyNowCandidateStatus: BuyNowCandidateStatus;

  @Prop({
    type: Number,
  })
  @ApiProperty({
    description: 'Default quotation request',
    example: 30000,
  })
  defaultQuotationRequest: number;

  @Prop({
    type: String,
  })
  @ApiProperty({
    description: 'Large Order Quotation Request',
    example:
      'Your order appears substantial. Please request a quote from us to offer a more suitable price on your order',
  })
  largeOrderQuotationRequest: string;
}

export type PurchaseSettingDocument = HydratedDocument<PurchaseSetting>;

export const PurchaseSettingSchema =
  SchemaFactory.createForClass(PurchaseSetting);
