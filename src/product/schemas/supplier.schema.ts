import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

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
export class Supplier extends Document {
  @Prop({ type: String })
  name: string;

  @Prop({ type: String })
  supplierId: string;

  @Prop({ type: String })
  country: string;

  @Prop({ type: String })
  appaMemberNumber: string;
}

export type SupplierDocument = HydratedDocument<Supplier>;

export const SupplierSchema = SchemaFactory.createForClass(Supplier).set(
  'versionKey',
  false,
);
