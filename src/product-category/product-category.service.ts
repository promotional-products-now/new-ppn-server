import { Injectable } from '@nestjs/common';
import {
  UpdateCategoriesDto,
  UpdateCategoryDto,
  UpdateSubCategoriesDto,
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
import { ObjectId } from 'mongodb';
import {
  GlobalProductSubCategory,
  GlobalProductSubCategoryDocument,
} from './schemas/globalSubCategory.schema';
import {
  GlobalProductCategory,
  GlobalProductCategoryDocument,
} from './schemas/globalCategory.schema';

@Injectable()
export class ProductCategoryService {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    @InjectModel(ProductCategory.name)
    private readonly productCategoryModel: Model<ProductCategoryDocument>,
    @InjectModel(ProductSubCategory.name)
    private readonly productSubCategoryModel: Model<ProductSubCategoryDocument>,

    @InjectModel(GlobalProductSubCategory.name)
    private readonly globalProductSubCategoryModel: Model<GlobalProductSubCategoryDocument>,

    @InjectModel(GlobalProductCategory.name)
    private readonly globalProductCategoryModel: Model<GlobalProductCategoryDocument>,
  ) {}

  // async findAll() {
  //   return await this.productCategoryModel.aggregate([
  //     {
  //       $group: {
  //         _id: '$name',
  //       },
  //     },
  //     {
  //       $project: {
  //         _id: 0,
  //         name: '$_id',
  //       },
  //     },
  //   ]);
  // }

  async findAll() {
    return await this.globalProductCategoryModel
      .find({ isActive: true })
      .select(['name', 'subCategory', 'totalProduct'])
      .populate({
        path: 'subCategory',
        model: GlobalProductSubCategory.name,
        select: 'name',
      });
  }

  async findAllSubCategory(categoryName: string) {
    return await this.productSubCategoryModel
      .find({ 'category.name': categoryName })
      .populate({
        path: 'category',
      });
  }

  async updateCategory(id, updateCategoryDto: UpdateCategoryDto) {
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
    return await this.productSubCategoryModel.findByIdAndUpdate(
      id,
      updateSubCategoryDto,
      { new: true },
    );
  }

  async updateCategories(updateCategoryDto: UpdateCategoriesDto) {
    const { ids, ...rest } = updateCategoryDto;
    const idsMap = ids.map((id) => new ObjectId(id));
    return await this.productCategoryModel.findByIdAndUpdate(
      { _id: { $in: idsMap } },
      rest,
      { new: true },
    );
  }

  async updateSubCategories(updateSubCategoryDto: UpdateSubCategoriesDto) {
    const { ids, ...rest } = updateSubCategoryDto;
    const idsMap = ids.map((id) => new ObjectId(id));
    return await this.productSubCategoryModel.updateMany(
      { _id: { $in: idsMap } },
      rest,
      { new: true },
    );
  }

  async findSuppliersCategories(id: string, query: FetchtQueryDto) {
    const { query: search } = query;

    const page = query.page ? Number(query.page) : 1;
    const limit = query.limit ? Number(query.limit) : 15;

    const payload: Record<string, any> = { supplier: new ObjectId(id) };

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
    const { query: search } = query;

    const page = query.page ? Number(query.page) : 1;
    const limit = query.limit ? Number(query.limit) : 15;

    const payload: Record<string, any> = { category: new ObjectId(id) };

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
