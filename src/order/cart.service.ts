import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from '../product/schemas/product.schema';
import { Supplier } from '../product/schemas/supplier.schema';
import { Cart, CartDocument } from './schemas/cart.schema';
import { AddCartItemDto, UpdateCartItemDto } from './dto/cart';
import { ObjectId } from 'mongodb';

@Injectable()
export class CartService {
  private logger = new Logger(CartService.name);

  constructor(
    @InjectModel(Cart.name)
    private readonly cartModel: Model<CartDocument>,
  ) {}

  async addToCart(inputs: AddCartItemDto): Promise<Cart> {
    inputs.userId = new ObjectId(inputs.userId);
    inputs.productId = new ObjectId(inputs.productId);

    this.logger.verbose(`adding to cart: ${JSON.stringify(inputs)}`);
    return await this.cartModel.create(inputs);
  }

  async findAll({ isCheckedOut, userId }) {
    this.logger.verbose(`finding cart items with`);

    const cartItems = await this.cartModel
      .find({
        userId: new ObjectId(userId as string),
        isCheckedOut: isCheckedOut,
      })
      .populate([
        'productId',
        {
          path: 'productId',
          model: Product.name,
          select: ['overview', 'supplier', '_id', 'isActive'],
          populate: {
            path: 'supplier',
            model: Supplier.name,
            select: ['name'],
          },
        },
      ]);

    return cartItems;
  }

  async findOne(id: string): Promise<Cart> {
    return this.cartModel.findById(id);
  }

  async update(inputs: Partial<UpdateCartItemDto>): Promise<Cart> {
    this.logger.verbose(`updating cart item with: ${JSON.stringify(inputs)}`);
    return await this.cartModel.findByIdAndUpdate(inputs.id, inputs);
  }

  async remove(id: string): Promise<boolean> {
    await this.cartModel.deleteOne({
      id: id,
    });
    return true;
  }
}
