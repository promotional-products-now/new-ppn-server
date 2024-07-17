import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';

@Schema({ timestamps: false, collection: 'productcategories' })
export class ProductCategory extends Document {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({
    type: [{ type: Types.ObjectId, ref: 'productsubcategories' }],
  })
  subCategory: Types.ObjectId[];

  @Prop({ type: String })
  id: string;

  @Prop({ type: Number, default: null })
  totalProducts: number;
}

export type ProductCategoryDocument = HydratedDocument<ProductCategory>;

export const ProductCategorySchema =
  SchemaFactory.createForClass(ProductCategory);
