/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { Stripe } from 'stripe';
import { ConfigService } from '@nestjs/config';
import { StripeConfig } from '../configs';
import { CheckoutInput } from './dto/checkout.dto';
import { OrderService } from '../order/order.service';
import { Order } from '../order/schemas/order.schema';
import { User } from '../user/schemas/user.schema';
import { STATUS_ENUM } from '../order/order.contants';
import { CartService } from 'src/order/cart.service';
import { CouponService } from 'src/coupon/coupon.service';

@Injectable()
export class CheckoutService {
  private logger = new Logger(CheckoutService.name);

  private stripe: Stripe;
  private stripeConfig: StripeConfig;

  constructor(
    private configService: ConfigService,
    private orderService: OrderService,
    private cartService: CartService,
    private couponService: CouponService,
  ) {
    this.stripeConfig = this.configService.get<StripeConfig>('stripe');
    this.stripe = new Stripe(this.stripeConfig.secretKey);
  }

  async processOrder(user: User, ppnCheckout: CheckoutInput) {
    let order: Order;

    const cartItems = await this.cartService.findAll({
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      userId: user._id,
      isCheckedOut: false,
    });

    let totalAmount = cartItems.reduce((acc, item) => acc + item.price, 0);

    // check coupon
    if (ppnCheckout.couponCode) {
      const { discount, isExpired } = await this.couponService.checkCoupon(
        ppnCheckout.couponCode,
        totalAmount,
        user.userType,
      );

      if (isExpired) {
        throw new BadRequestException('coupon expired');
      }

      totalAmount = totalAmount - discount;
    }

    try {
      order = await this.orderService.create({
        cartItems: cartItems.map((cartItem) => ({
          cartId: cartItem._id,
          price: cartItem.price,
          productId: cartItem.productId,
          quantity: cartItem.quantity,
        })),
        status: STATUS_ENUM.PENDING,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        // fix issues with userid types
        userId: user._id || user.id,
        totalAmount: totalAmount,
      });

      if (order) {
        const data = await this.checkout(user, order, ppnCheckout);
        return { ...data, orderId: order.id };
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
    order: Order,
    ppnCheckout: CheckoutInput,
  ): Promise<Stripe.Checkout.Session> {
    try {
      const domain = this.configService.getOrThrow('domain');
      const url = `https://${domain}/api/v1/checkout/redirector`;
      // const url = `http://localhost:3010/api/v1/checkout/redirector`;
      const orderId = order._id.toString();

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
              },
              unit_amount: price,
            },
            quantity: item.quantity,
          };
        }),
        mode: 'payment',
        success_url: `${url}?status=success&orderId=${orderId}`,
        cancel_url: `${url}?status=cancelled&orderId=${orderId}`,
        discounts: ppnCheckout.couponCode
          ? [{ coupon: ppnCheckout.couponCode }]
          : undefined,
        metadata: {
          // @ts-expect-error/
          // `_id` doesnt not exist on user, fix issues with userid types
          customerId: String(user._id),
          customerEmail: user.email.address,
          orderId: orderId,
          orderDate: new Date().toISOString(),
        },
      });

      return session;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async handleRedirectCallback(inputs) {
    const { orderId, status } = inputs;

    const statusMap = {
      success: STATUS_ENUM.SUCCESS,
      cancelled: STATUS_ENUM.CANCELLED,
    };

    this.logger.verbose(`Order ${orderId} has been ${status}`);
    await this.orderService.update({
      id: orderId,
      status: statusMap[status],
    });
  }
}
