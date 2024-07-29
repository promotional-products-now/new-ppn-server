import { Document, HydratedDocument } from 'mongoose';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';

@Schema({
  timestamps: true,
})
export class Addition extends Document {
  @Prop({ type: String })
  key: string;

  @Prop({ type: String })
  type: string;

  @Prop({ type: Number })
  setup: number;

  @Prop({ type: String })
  currency: string;

  @Prop({ type: String, required: false })
  leadTime: string;

  @Prop({ type: String })
  description: string;

  @Prop({ type: Boolean })
  undecorated: boolean;

  @Prop({ type: [{ qty: Number, price: Number }] })
  priceBreaks: { qty: number; price: number }[];
}

export type AdditionDocument = HydratedDocument<Addition>;

export const AdditionSchema = SchemaFactory.createForClass(Addition).set(
  'versionKey',
  false,
);
