import { Document, HydratedDocument, Types } from 'mongoose';
import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';

export enum STATUS_ENUM {
  FAILED = 'failed',
  SUCCESS = 'success',
  CANCELLED = 'cancelled',
  PENDING = 'pending',
  CASH_ON_DELIVERY = 'cash_on_delivery',
  DELIVERED = 'delivered',
}

export class OrderCartItem {
  productId: string;
  quantity: number;
  price: number;
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
  @Prop()
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
