import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';
import { ProductSubCategory } from './subCategory.schema';

@Schema({ timestamps: false, collection: 'productcategories' })
export class ProductCategory extends Document {
  @Prop({ type: String })
  name: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: ProductSubCategory.name }] })
  subCategory: Types.ObjectId[];

  @Prop({ type: String })
  id: String;

  @Prop({ type: Number, default: null })
  totalProducts: number;
}

export type ProductCategoryDocument = HydratedDocument<ProductCategory>;

export const ProductCategorySchema =
  SchemaFactory.createForClass(ProductCategory);
