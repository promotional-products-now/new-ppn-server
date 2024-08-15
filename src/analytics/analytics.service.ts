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
    const totalProduct = await this.productModel.countDocuments({
      isActive: true,
      'supplier.isActive': true,
      'category.isActive': true,
      'subCategory.isActive': true,
    });

    const totalOrders = await this.OrderModel.countDocuments({
      status: { $nin: ['failed', 'cancelled'] },
    });

    //TODO add total earnings
    return { totalProduct, totalOrders };
  }
}
