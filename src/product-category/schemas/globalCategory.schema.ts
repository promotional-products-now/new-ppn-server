import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

@Schema({
  collection: 'globalproductcategories',
})
export class GlobalProductCategory extends Document {
  @Prop({ type: String })
  @ApiProperty({ type: 'string', example: 'Electronics' })
  name: string;

  @Prop({ type: String })
  @ApiProperty({ type: 'string', example: 'A-02' })
  id: string;

  @Prop({
    type: [{ type: Types.ObjectId, ref: 'globalproductsubcategories' }],
  })
  subCategory: Types.ObjectId[];

  @Prop({ type: Number, default: null })
  totalProduct: number;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;
}

export type GlobalProductCategoryDocument =
  HydratedDocument<GlobalProductCategory>;

export const GlobalProductCategorySchema = SchemaFactory.createForClass(
  GlobalProductCategory,
);
