import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Order, OrderDocument } from './schemas/order.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateOrderDto } from './dto/create-order';
import { UpdateOrderDto } from './dto/update-order';
import { FindOrderDto } from './dto/find-order';
import { ObjectId } from 'mongodb';
import { Product } from '../product/schemas/product.schema';
import { Supplier } from '../product/schemas/supplier.schema';
import { Cart, CartDocument } from './schemas/cart.schema';
import { STATUS_ENUM } from './order.contants';

@Injectable()
export class OrderService {
  private logger = new Logger(OrderService.name);

  constructor(
    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,

    @InjectModel(Cart.name)
    private readonly cartModel: Model<CartDocument>,
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
      .populate([
        'userId',
        {
          path: 'cartItems.productId',
          model: Product.name,
          select: ['overview', 'supplier', '_id', 'isActive'],
          populate: {
            path: 'supplier',
            model: Supplier.name,
            select: ['name'],
          },
        },
      ])
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
    const data = await this.orderModel.aggregate([
      {
        $match: {
          _id: new ObjectId(id),
        },
      },

      {
        $unwind: '$cartItems',
      },

      {
        $addFields: {
          'cartItems.productId': { $toObjectId: '$cartItems.productId' },
          userId: { $toObjectId: '$userId' },
        },
      },

      {
        $lookup: {
          from: 'products',
          localField: 'cartItems.productId',
          foreignField: '_id',
          as: 'productsDetails',
        },
      },

      {
        $unwind: '$productsDetails',
      },

      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userDetails',
        },
      },

      {
        $unwind: '$userDetails',
      },

      {
        $group: {
          _id: '$_id',
          cartItems: {
            $push: {
              productId: '$cartItems.productId',
              quantity: '$cartItems.quantity',
              product: '$productsDetails',
            },
          },
          totalQuantity: { $sum: '$cartItems.quantity' },
          status: { $first: '$status' },
          totalAmount: { $sum: '$cartItems.price' },
          userId: { $first: '$userDetails' },
          user: { $first: '$userDetails' },
          createdAt: { $first: '$createdAt' },
          updatedAt: { $first: '$updatedAt' },
        },
      },

      {
        $project: {
          _id: 0,
          id: '$_id',
          cartItems: 1,
          totalAmount: 1,
          totalQuantity: 1,
          status: 1,
          user: 1,
        },
      },
    ]);
    return data[0];
  }

  async update(inputs: Partial<UpdateOrderDto>): Promise<Order> {
    this.logger.verbose(`updating order with: ${JSON.stringify(inputs)}`);

    const order = await this.orderModel.findById(inputs.id);

    if (!order) {
      throw new NotFoundException(`Order with ID ${inputs.id} not found`);
    }

    // find all the products in the cart and `mark them as complete` them once the order is successful
    if (inputs.status && inputs.status === STATUS_ENUM.SUCCESS) {
      const cartItemIds = order.cartItems.map((cartItem) => cartItem._id);
      await this.cartModel.updateMany(
        {
          id: { $in: cartItemIds },
        },
        { $set: { isCheckedOut: true } },
      );
    }

    return await this.orderModel.findByIdAndUpdate(inputs.id, inputs);
  }

  async remove(id: string): Promise<boolean> {
    await this.orderModel.deleteOne({
      id: id,
    });
    return true;
  }
}
