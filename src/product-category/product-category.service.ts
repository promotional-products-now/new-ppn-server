import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductCategoryDto } from './dto/create-product-category.dto';
import { UpdateProductCategoryDto } from './dto/update-product-category.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Product, ProductDocument } from '../product/schemas/product.schema';
import { Model } from 'mongoose';
import {
  ProductCategory,
  ProductCategoryDocument,
} from './schemas/category.schema';
import { ProductSubCategory } from './schemas/subCategory.schema';

@Injectable()
export class ProductCategoryService {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    @InjectModel(ProductCategory.name)
    private readonly productCategoryModel: Model<ProductCategoryDocument>,
  ) {}

  async findAll() {
    return await this.productCategoryModel.find();
  }

  async findAllSubCategory(categoryName: string) {
    const category = await this.productCategoryModel
      .find()
      // .findOne({ name: categoryName })
      .populate({ path: 'subCategory', model: ProductSubCategory.name });

    console.log({ category });
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }
}
