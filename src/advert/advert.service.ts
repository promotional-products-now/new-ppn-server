import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Advert, AdvertDocument } from './schemas/advert.schema';
import { Product } from 'src/product/schemas/product.schema';
import { ProductCategory } from '../product-category/schemas/category.schema';

@Injectable()
export class AdvertService {
  constructor(
    @InjectModel(Advert.name) private advertModel: Model<AdvertDocument>,
  ) {}

  async create(createAdvertDto: any): Promise<Advert> {
    const newAdvert = await this.advertModel.create(createAdvertDto);

    return newAdvert;
  }

  async findAll(): Promise<Advert[]> {
    return this.advertModel
      .find()
      .populate([
        { path: 'productId', model: Product.name },
        { path: 'category', model: ProductCategory.name },
      ])
      .exec();
  }

  async findById(id: string): Promise<Advert> {
    return this.advertModel.findById(id).exec();
  }

  async update(id: string, updateAdvertDto: any): Promise<Advert> {
    return this.advertModel
      .findByIdAndUpdate(id, updateAdvertDto, { new: true })
      .exec();
  }

  async delete(id: string): Promise<any> {
    return this.advertModel.findByIdAndDelete(id).exec();
  }
}
