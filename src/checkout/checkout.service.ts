/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { Stripe } from 'stripe';
import { ConfigService } from '@nestjs/config';
import { StripeConfig } from 'src/configs';
import { CheckoutInput } from './dto/checkout.dto';
import { OrderService } from 'src/order/order.service';
import { Order, STATUS_ENUM } from 'src/order/schemas/order.schema';
import { User } from 'src/user/schemas/user.schema';

@Injectable()
export class CheckoutService {
  private logger = new Logger(CheckoutService.name);

  private stripe: Stripe;
  private stripeConfig: StripeConfig;

  constructor(
    private configService: ConfigService,
    private orderService: OrderService,
  ) {
    this.stripeConfig = this.configService.get<StripeConfig>('stripe');
    this.stripe = new Stripe(this.stripeConfig.secretKey);
  }

  async processOrder(user: User, ppnCheckout: CheckoutInput) {
    let order: Order;

    try {
      const items = ppnCheckout.cartItems;
      order = await this.orderService.create({
        cartItems: items.map((item) => ({
          price: item.price,
          productId: item.productId,
          quantity: item.quantity,
        })),
        status: STATUS_ENUM.PENDING,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        // fix issues with userid types
        userId: user._id || user.id,
        totalAmount: items.reduce((acc, item) => acc + item.price, 0),
      });

      if (order) {
        // create checkout session
        const data = await this.checkout(user, ppnCheckout);
        return data;
      }
    } catch (error) {
      this.logger.error(`failed to create checkout: ${error.message}`);
      if (order) {
        this.orderService.update({
          id: order._id as string,
          status: STATUS_ENUM.FAILED,
        });
      }

      throw new BadRequestException(error.message);
    }
  }

  async checkout(
    user: User,
    ppnCheckout: CheckoutInput,
  ): Promise<Stripe.Checkout.Session> {
    try {
      const session = await this.stripe.checkout.sessions.create({
        customer_email: user.email.address,
        line_items: ppnCheckout.cartItems.map((item) => {
          const price = item.price * 100;

          return {
            price_data: {
              currency: 'usd',
              product_data: {
                name: item.name,
                description: item.description,
                images: [item.image],
              },
              unit_amount: price,
            },
            quantity: item.quantity,
          };
        }),
        mode: 'payment',
        success_url: this.stripeConfig.webhookEndpoint,
        cancel_url: this.stripeConfig.webhookEndpoint,
        metadata: {
          // @ts-expect-error
          // `_id` doesnt not exist on user, fix issues with userid types
          customerId: user._id,
          customerEmail: user.email.address,
          orderDate: new Date().toISOString(),
        },
      });

      return session;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
