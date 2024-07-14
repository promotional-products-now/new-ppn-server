import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';
import { Supplier } from './supplier.schema';
import { ApiProperty } from '@nestjs/swagger';

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
}

export type ProductCategoryDocument = HydratedDocument<ProductCategory>;

export const ProductCategorySchema =
  SchemaFactory.createForClass(ProductCategory);
