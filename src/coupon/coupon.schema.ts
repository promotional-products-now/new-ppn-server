import { Document, HydratedDocument } from 'mongoose';
import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { UserType } from 'src/user/enums/userType.enum';

@Schema({
  timestamps: true,
})
export class Coupon extends Document {
  @ApiProperty({
    type: 'string',
    example: 'testCoupon',
    description: 'The coupon name',
  })
  @Prop({ type: String })
  name?: string;

  @ApiProperty({
    type: 'string',
    example: 'Coupon discount for laptop products',
    description: 'coupon description',
  })
  @Prop({ type: String })
  description?: string;

  @ApiProperty({
    type: 'string',
    example: 'PPN-wHZC',
  })
  @Prop({ type: String })
  code: string;

  @ApiProperty({
    type: Date,
    example: new Date().toISOString(),
  })
  @Prop({ type: Date })
  expiresAt: Date;

  @ApiProperty({
    type: Boolean,
    example: false,
  })
  @Prop({ type: Boolean, default: false })
  isExpired?: boolean;

  @ApiProperty({
    type: 'number',
    description: 'Discount in percentage',
    example: 10,
  })
  @Prop({ type: Number, default: 5 })
  discount: number;

  @Prop({ type: String })
  stripeId?: string;

  @ApiProperty({
    type: UserType,
    description: 'different user tiers',
  })
  @IsOptional()
  @Prop({ type: String })
  userType: UserType;
}

export type CouponDocument = HydratedDocument<Coupon>;
export const CouponSchema = SchemaFactory.createForClass(Coupon).set(
  'versionKey',
  false,
);

CouponSchema.index({ 'coupon.name': 'text' });
