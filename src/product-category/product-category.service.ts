import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductCategoryDto } from './dto/create-product-category.dto';
import {
  UpdateCategoryDto,
  UpdateSubCategoryDto,
} from './dto/update-product-category.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Product, ProductDocument } from '../product/schemas/product.schema';
import { Model } from 'mongoose';
import {
  ProductCategory,
  ProductCategoryDocument,
} from './schemas/category.schema';
import {
  ProductSubCategory,
  ProductSubCategoryDocument,
} from './schemas/subCategory.schema';
import { FetchtQueryDto } from './dto/fetch-query.dto';

@Injectable()
export class ProductCategoryService {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    @InjectModel(ProductCategory.name)
    private readonly productCategoryModel: Model<ProductCategoryDocument>,
    @InjectModel(ProductSubCategory.name)
    private readonly productSubCategoryModel: Model<ProductSubCategoryDocument>,
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

  async updateCategory(id: string, updateCategoryDto: UpdateCategoryDto) {
    return await this.productCategoryModel.findByIdAndUpdate(
      id,
      updateCategoryDto,
      { new: true },
    );
  }

  async updateSubCategory(
    id: string,
    updateSubCategoryDto: UpdateSubCategoryDto,
  ) {
    return await this.productCategoryModel.findByIdAndUpdate(
      id,
      updateSubCategoryDto,
      { new: true },
    );
  }

  async findSuppliersCategories(id: string, query: FetchtQueryDto) {
    const { page, limit, query: search } = query;

    let payload: Record<string, any> = { supplier: id };

    if (search) {
      const regex = new RegExp(search, 'i');
      payload.name = { $regex: regex };
    }

    const categories = await this.productCategoryModel
      .find(payload)
      .skip(limit * (page - 1))
      .limit(limit)
      .sort({ createdAt: -1 });

    const count = await this.productCategoryModel.countDocuments(payload);
    const totalPages = Math.ceil(count / limit);

    return {
      docs: categories,
      page,
      limit,
      totalItems: count,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  }

  async findSubCategoriesByCategory(id: string, query: FetchtQueryDto) {
    const { page, limit, query: search } = query;

    let payload: Record<string, any> = { category: id };

    if (search) {
      const regex = new RegExp(search, 'i');
      payload.name = { $regex: regex };
    }

    const subCategories = await this.productSubCategoryModel
      .find(payload)
      .skip(limit * (page - 1))
      .limit(limit)
      .sort({ createdAt: -1 });

    const count = await this.productSubCategoryModel.countDocuments(payload);
    const totalPages = Math.ceil(count / limit);

    return {
      docs: subCategories,
      page,
      limit,
      totalItems: count,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  }
}
