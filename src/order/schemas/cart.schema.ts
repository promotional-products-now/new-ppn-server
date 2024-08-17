import { Document, HydratedDocument, Types } from 'mongoose';
import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Product } from 'src/product/schemas/product.schema';
import { User } from 'src/user/schemas/user.schema';

class CartAttribute {
  key: string;
  value: string;
}

class BrandingInfo {
  type: 'PRINT' | 'ENGRAVE' | 'TRANSFER';
  artwork: 'MULTI' | 'SINGLE';
  position: 'ONE' | 'TWO';
}

@Schema({
  timestamps: true,
})
export class Cart extends Document {
  @ApiProperty({ type: 'string', example: '666d98ab565f924157e31c54' })
  @Prop({ type: Types.ObjectId, ref: User.name })
  userId: Types.ObjectId;

  @ApiProperty({
    type: 'string',
    example: '1a239e24bd1b90d4257a',
  })
  @Prop({ type: Types.ObjectId, ref: Product.name })
  productId: Types.ObjectId;

  /**
   * The product associated with the order item. populated during agreegation
   */
  product?: Product;

  @ApiProperty({
    type: 'number',
    example: 5,
  })
  @Prop({ type: Number })
  quantity: number;

  @ApiProperty({
    type: 'number',
    example: 10.99,
  })
  @Prop({ type: Number })
  price: number;

  @ApiProperty({
    type: 'number',
    example: [
      {
        key: 'color',
        value: 'red',
      },
      {
        key: 'snaphook',
        value: 'red',
      },
      {
        key: 'color',
        value: 'red',
      },
    ],
  })
  @Prop({ type: CartAttribute })
  attributes?: CartAttribute[];

  @ApiProperty({
    type: 'boolean',
    example: false,
  })
  @Prop({ type: Boolean, default: false })
  isCheckedOut?: boolean;

  @ApiProperty({
    type: 'object',
    example: {
      type: 'PRINT',
      artwork: 'MULTI',
      position: 'ONE',
    },
  })
  @Prop({ type: BrandingInfo })
  brandingInfo?: BrandingInfo;
}

export type CartDocument = HydratedDocument<Cart>;
export const CartSchema = SchemaFactory.createForClass(Cart).set(
  'versionKey',
  false,
);

CartSchema.index({ 'cart.name': 'text' });
