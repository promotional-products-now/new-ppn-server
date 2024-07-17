import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';
import { STATUS_ENUM } from '../product.interface';
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
export class Supplier extends Document {
  @Prop({ type: String })
  @ApiProperty()
  name: string;

  @Prop({ type: String })
  @ApiProperty()
  supplierId: string;

  @Prop({ type: String })
  @ApiProperty()
  country: string;

  @Prop({ type: String })
  @ApiProperty()
  appaMemberNumber: string;

  @Prop({ type: Boolean, default: true })
  @ApiProperty({ type: 'boolean', example: true })
  isActive: boolean;

  @Prop({ type: String, enum: STATUS_ENUM, default: STATUS_ENUM.BUY_NOW })
  @ApiProperty({
    type: 'string',
    enum: STATUS_ENUM,
    example: STATUS_ENUM.BUY_NOW,
  })
  status: string;
}

export type SupplierDocument = HydratedDocument<Supplier>;

export const SupplierSchema = SchemaFactory.createForClass(Supplier).set(
  'versionKey',
  false,
);
