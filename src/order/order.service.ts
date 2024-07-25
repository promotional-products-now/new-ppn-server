import { Injectable, Logger } from '@nestjs/common';
import { Order, OrderDocument } from './schemas/order.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateOrderDto } from './dto/create-order';
import { UpdateOrderDto } from './dto/update-order';

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

  async findAll(): Promise<Order[]> {
    return await this.orderModel.find();
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
