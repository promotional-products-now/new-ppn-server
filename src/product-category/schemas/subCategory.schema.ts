import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';

@Schema({ timestamps: false, collection: 'productsubcategories' })
export class ProductSubCategory extends Document {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: Types.ObjectId, ref: 'ProductCategory', required: true })
  category: Types.ObjectId;

  @Prop({ type: String })
  id: string;
}

export type ProductSubCategoryDocument = HydratedDocument<ProductSubCategory>;

export const ProductSubCategorySchema =
  SchemaFactory.createForClass(ProductSubCategory);