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
  addressLine2: string;

  @IsString()
  city: string;

  @IsString()
  state: string;

  @IsString()
  zipCode: string;

  @IsString()
  country: string;
}

export class ShippingAddress {
  @IsString()
  addressLine1: string;

  @IsString()
  addressLine2: string;

  @IsString()
  city: string;

  @IsString()
  state: string;

  @IsString()
  zipCode: string;

  @IsString()
  country: string;
}

export class CheckoutInput {
  @IsNotEmpty()
  @ValidateNested({ each: true })
  cartItems: CartItem[];

  @IsDate()
  orderDate: Date;

  @ValidateNested()
  billingAddress: BillingAddress;

  @ValidateNested()
  shippingAddress: ShippingAddress;

  @IsString()
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
