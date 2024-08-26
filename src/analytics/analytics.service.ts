import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from '../product/schemas/product.schema';
import { Order, OrderDocument } from 'src/order/schemas/order.schema';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    @InjectModel(Order.name)
    private readonly OrderModel: Model<OrderDocument>,
  ) {}

  async getDashboardTotal() {
    const totalProduct = await this.productModel.countDocuments();

    const totalOrders = await this.OrderModel.countDocuments();

    const totalEarnings = await this.OrderModel.aggregate([
      {
        $match: {
          status: 'success',
        },
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: '$totalAmount',
          },
        },
      },
    ]).then((result) => result[0]?.total || 0);

    return { totalProduct, totalOrders, totalEarnings };
  }
}
