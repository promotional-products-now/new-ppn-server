import { Injectable, BadRequestException } from '@nestjs/common';
import { Stripe } from 'stripe';
import { ConfigService } from '@nestjs/config';
import { StripeConfig } from 'src/configs';
import { CheckoutInput } from './dto/checkout.dto';

@Injectable()
export class CheckoutService {
  private stripe: Stripe;

  constructor(private configService: ConfigService) {
    const stripeConfig = this.configService.get<StripeConfig>('stripe');

    this.stripe = new Stripe(
      this.configService.get<string>('STRIPE_SECRET_KEY'),
    );
  }

  async checkout(ppnCheckout: CheckoutInput): Promise<Stripe.Checkout.Session> {
    try {
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: ppnCheckout.cartItems.map((item) => ({
          price_data: {
            currency: 'usd',
            product_data: {
              name: item.name,
              description: item.description,
              images: [item.image],
            },
            unit_amount: item.price * 100, // Stripe amount in cents
          },
          quantity: item.quantity,
        })),
        mode: 'payment',
        success_url: this.configService.get<string>('STRIPE_SUCCESS_URL'),
        cancel_url: this.configService.get<string>('STRIPE_CANCEL_URL'),
        customer_email: ppnCheckout.paymentMethod,
        metadata: {
          orderDate: ppnCheckout.orderDate.toISOString(),
          billingAddress: JSON.stringify(ppnCheckout.billingAddress),
          shippingAddress: JSON.stringify(ppnCheckout.shippingAddress),
        },
      });

      return session;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
