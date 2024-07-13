import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';

@Schema({ timestamps: false })
export class ProductSubCategory extends Document {
  @Prop({ type: String })
  name: string;

  @Prop({ type: { type: Types.ObjectId, ref: 'productCategories' } })
  category: Types.ObjectId;

  @Prop({ type: String })
  id: String;
}

export type ProductSubCategoryDocument = HydratedDocument<ProductSubCategory>;

export const ProductSubCategorySchema =
  SchemaFactory.createForClass(ProductSubCategory);
