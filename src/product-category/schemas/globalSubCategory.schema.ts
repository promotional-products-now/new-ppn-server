import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { ProductCategory } from './category.schema';
import { ApiProperty } from '@nestjs/swagger';

@Schema({
  timestamps: false,
  versionKey: false,
  collection: 'globalproductsubcategories',
})
export class GlobalProductSubCategory {
  @Prop({ type: String })
  @ApiProperty({ type: 'string', example: 'A-02' })
  id: string;

  @Prop({ type: String })
  name: string;

  @Prop({ type: Types.ObjectId, ref: ProductCategory.name })
  category: Types.ObjectId;
}

export type GlobalProductSubCategoryDocument =
  HydratedDocument<GlobalProductSubCategory>;

export const GlobalProductSubCategorySchema = SchemaFactory.createForClass(
  GlobalProductSubCategory,
);
