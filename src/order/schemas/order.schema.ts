import { Document, HydratedDocument, Types } from 'mongoose';
import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { STATUS_ENUM } from '../order.contants';
import { Product } from 'src/product/schemas/product.schema';
import { User } from 'src/user/schemas/user.schema';

export class OrderCartItem {
  productId: string;
  quantity: number;
  price: number;

  /**
   * The product associated with the order item. populated during agreegation
   */
  product?: Product;
}

@Schema({
  timestamps: true,
})
export class Order extends Document {
  @ApiProperty({
    type: 'string',
    enum: STATUS_ENUM,
    example: STATUS_ENUM.SUCCESS,
  })
  @Prop({ type: String, enum: STATUS_ENUM, default: STATUS_ENUM.SUCCESS })
  status: string;

  @ApiProperty({ type: 'number', example: 100.99 })
  @Prop({ type: { type: 'number' } })
  totalAmount: number;

  @ApiProperty({ type: 'string', example: '666d98ab565f924157e31c54' })
  @Prop({ type: Types.ObjectId, ref: User.name })
  userId: Types.ObjectId;

  @ApiProperty({ type: OrderCartItem, example: '666d98ab565f924157e31c54' })
  @Prop({ type: [{ type: OrderCartItem }] })
  cartItems: OrderCartItem;
}

export type OrderDocument = HydratedDocument<Order>;
export const OrderSchema = SchemaFactory.createForClass(Order).set(
  'versionKey',
  false,
);

OrderSchema.index({ 'order.name': 'text' });
