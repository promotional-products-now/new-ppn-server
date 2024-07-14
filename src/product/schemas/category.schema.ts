import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';
import { Supplier } from './supplier.schema';
import { ApiProperty } from '@nestjs/swagger';
import { STATUS_ENUM } from '../product.interface';

@Schema({
  timestamps: false,
  toJSON: {
    transform: function (doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    },
  },
})
export class ProductCategory extends Document {
  @Prop({ type: String })
  @ApiProperty({ type: 'string', example: 'Electronics' })
  name: string;

  @Prop({ type: Types.ObjectId, ref: Supplier.name })
  @ApiProperty({ type: 'string', example: '666d98ab565f924157e31c54' })
  supplier: Types.ObjectId;

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

export type ProductCategoryDocument = HydratedDocument<ProductCategory>;

export const ProductCategorySchema =
  SchemaFactory.createForClass(ProductCategory);
