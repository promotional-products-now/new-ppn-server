import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';
import { ProductCategory } from './category.schema';
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
export class ProductSubCategory extends Document {
  @Prop({ type: String })
  name: string;

  @Prop({ type: { type: Types.ObjectId, ref: ProductCategory.name } })
  category: Types.ObjectId;

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

export type ProductSubCategoryDocument = HydratedDocument<ProductSubCategory>;

export const ProductSubCategorySchema =
  SchemaFactory.createForClass(ProductSubCategory);
