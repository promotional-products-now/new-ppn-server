import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';

export class BillingAddress {
  @IsString()
  addressLine1: string;

  @IsString()
  addressLine2?: string;

  @IsString()
  city: string;

  @IsString()
  state: string;

  @IsString()
  zipCode?: string;

  @IsString()
  country: string;
}

export class ShippingAddress {
  @IsString()
  addressLine1: string;

  @IsString()
  addressLine2?: string;

  @IsString()
  city: string;

  @IsString()
  state: string;

  @IsString()
  zipCode?: string;

  @IsString()
  country: string;
}

export class CheckoutInput {
  @ApiProperty({
    description: 'cart items',
  })
  @IsNotEmpty()
  @ValidateNested({ each: true })
  cartItems: CartItem[];

  @ApiProperty({
    description: '',
  })
  @IsDate()
  orderDate: Date;

  @ValidateNested()
  @ApiProperty({
    description: 'cart items',
  })
  billingAddress: Partial<BillingAddress>;

  @ValidateNested()
  shippingAddress: Partial<ShippingAddress>;

  @IsString()
  @ApiProperty({
    description: 'payment',
  })
  paymentMethod: string;
}

export class CartItem {
  @IsString()
  productId: string;

  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsNumber()
  price: number;

  @IsString()
  image: string;

  @IsNumber()
  quantity: number;
}
