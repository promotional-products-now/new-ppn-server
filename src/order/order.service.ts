import { Injectable, Logger } from '@nestjs/common';
import { Order, OrderDocument } from './schemas/order.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateOrderDto } from './dto/create-order';
import { UpdateOrderDto } from './dto/update-order';
import { FindOrderDto } from './dto/find-order';

@Injectable()
export class OrderService {
  private logger = new Logger(OrderService.name);

  constructor(
    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,
  ) {}

  async create(inputs: CreateOrderDto): Promise<Order> {
    this.logger.verbose(`creating new order: ${JSON.stringify(inputs)}`);
    return await this.orderModel.create(inputs);
  }

  /**
   * Finds orders based on the provided search criteria.
   *
   * @param {FindOrderDto} inputs - The search criteria for finding orders.
   * @return {Promise<{ docs: OrderDocument[], page: number, limit: number, totalItems: number, totalPages: number, hasNextPage: boolean, hasPrevPage: boolean }>} - The found orders and pagination information.
   */
  async findAll(inputs: FindOrderDto) {
    const { page, limit } = inputs;
    const searchTerm: Record<string, any> = {};

    if (inputs.status) {
      searchTerm.status = inputs.status;
    }

    if (inputs.userId) {
      searchTerm.userId = inputs.userId;
    }

    if (inputs.productId) {
      searchTerm.cartItems = {
        $elemMatch: {
          productId: inputs.productId,
        },
      };
    }

    this.logger.verbose(`finding orders with: ${JSON.stringify(searchTerm)}`);

    const orders = await this.orderModel
      .find(searchTerm)
      .skip(limit * (page - 1))
      .limit(limit)
      .sort({ createdAt: -1 });

    const count = await this.orderModel.countDocuments(searchTerm);
    const totalPages = Math.ceil(count / limit);

    return {
      docs: orders,
      page: page,
      limit: limit,
      totalItems: count,
      totalPages: totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  }

  async findOne(id: string): Promise<Order> {
    return await this.orderModel.findById(id).exec();
  }

  async update(inputs: Partial<UpdateOrderDto>): Promise<Order> {
    this.logger.verbose(`updating order with: ${JSON.stringify(inputs)}`);
    return await this.orderModel.findByIdAndUpdate(inputs.id, inputs);
  }

  async remove(id: string): Promise<boolean> {
    await this.orderModel.deleteOne({
      id: id,
    });
    return true;
  }
}
