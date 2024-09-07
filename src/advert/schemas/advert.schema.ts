import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';
import { Product } from '../../product/schemas/product.schema';
import { ApiProperty } from '@nestjs/swagger';

@Schema({ timestamps: true })
export class Advert {
  @ApiProperty({
    description: 'Title of the advert',
    example: 'Brand New Laptop',
  })
  @Prop({ required: true })
  title: string;

  @ApiProperty({
    description: 'Detailed description of the advert',
    example: 'A brand new laptop with 16GB RAM',
  })
  @Prop({ required: false })
  description: string;

  @ApiProperty({
    description: 'ID of the user who created the advert',
    type: String,
  })
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: Product.name })
  productId: Types.ObjectId;

  @ApiProperty({
    description: 'List of tags associated with the advert',
    example: ['electronics', 'laptop'],
  })
  @Prop({ type: [String], default: [] })
  tags: string[];

  @ApiProperty({
    description: 'Status of the advert',
    enum: ['active', 'inactive', 'sold'],
    example: 'active',
  })
  @Prop({ default: 'active', enum: ['active', 'inactive', 'soldOut'] })
  status: string;

  @ApiProperty({
    description: 'category ID the advert belongs to',
    type: String,
  })
  @Prop({ type: Types.ObjectId, ref: 'Category' })
  category: Types.ObjectId;

  @ApiProperty({
    description: 'Metadata like views, likes, and shares',
    example: { views: 100 },
  })
  @Prop({ type: MongooseSchema.Types.Mixed })
  metadata: {
    views: number;
  };
}
export type AdvertDocument = HydratedDocument<Advert>;

export const AdvertSchema = SchemaFactory.createForClass(Advert);
