import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

@Schema({
  timestamps: true,
})
export class BasePrice extends Document {
  @Prop({ type: String })
  key: string;

  @Prop({ type: [String] })
  tags: string[];

  @Prop({ type: String })
  type: string;

  @Prop({ type: Number })
  setup: number;

  @Prop({ type: Boolean })
  indent: boolean;

  @Prop({ type: String })
  currency: string;

  @Prop({ type: String })
  leadTime: string;

  @Prop({ type: String })
  description: string;

  @Prop({ type: Boolean })
  undecorated: boolean;

  @Prop({ type: [{ qty: Number, price: Number }] })
  priceBreaks: { qty: number; price: number }[];
}

export type BasePriceDocument = HydratedDocument<BasePrice>;

export const BasePriceSchema = SchemaFactory.createForClass(BasePrice).set(
  'versionKey',
  false,
);
