import { Document, HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';

@Schema({
  timestamps: true,
  toJSON: {
    transform: function (doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    },
  },
})
export class PurchaseSetting extends Document {
  @Prop({ type: Number, default: 30000 })
  @ApiProperty({ type: 'number', example: 300000 })
  defaultQuotationRequest: number;

  @Prop({ type: String })
  @ApiProperty({
    type: 'string',
    example:
      'Your order substantial. Please request a quote for us to offer a more suitable price on your order',
  })
  largeOrderQuotationRequest: string;
}

export type PurchaseSettingDocument = HydratedDocument<PurchaseSetting>;

export const PurchaseSettingSchema = SchemaFactory.createForClass(
  PurchaseSetting,
).set('versionKey', false);
