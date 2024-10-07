import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Supplier, SupplierDocument } from './schemas/supplier.schema';
import { Product, ProductDocument } from './schemas/product.schema';
import { FilterProductQueryDto } from './dto/filter-product-query.dto';
import { FetchtQueryDto } from './dto/fetch-query.dto';
import {
  UdpateSupplierDto,
  UdpateSuppliersDto,
} from './dto/update-supplier.dto';
import { ObjectId } from 'mongodb';
import {
  ProductCategory,
  ProductCategoryDocument,
} from '../product-category/schemas/category.schema';
import {
  ProductSubCategory,
  ProductSubCategoryDocument,
} from '../product-category/schemas/subCategory.schema';
import {
  UpdateCategoriesDto,
  UpdateSubCategoriesDto,
} from '../product-category/dto/update-product-category.dto';
import {
  UpdateCategoryDto,
  UpdateSubCategoryDto,
} from './dto/update-product.dto';

@Injectable()
export class SupplierService {
  constructor(
    @InjectModel(Supplier.name)
    private readonly supplierModel: Model<SupplierDocument>,
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    @InjectModel(ProductCategory.name)
    private readonly productCategoryModel: Model<ProductCategoryDocument>,
    @InjectModel(ProductSubCategory.name)
    private readonly productSubCategoryModel: Model<ProductSubCategoryDocument>,
  ) {}

  async findSuppliers(query: FetchtQueryDto) {
    const page = query.page ? Number(query.page) : 1;
    const limit = query.limit ? Number(query.limit) : 15;

    const filter: Record<string, any> = {};

    if (query.query) {
      filter.$or = [{ name: { $regex: new RegExp(query.query, 'gi') } }];
    }

    if (query.isActive) {
      filter.isActive = true;
    }

    const sortOptions: { [key: string]: any } = {
      'A-Z': { 'product.name': 1 },
      'Z-A': { 'product.name': -1 },
      default: { createdAt: -1 },
    };
    const sort = sortOptions[query.sort] || sortOptions.default;

    const suppliers = await this.supplierModel
      .find(filter, {}, { sort, skip: limit * (page - 1), limit })
      .select('name status supplierId isActive country appaMemberNumber');

    const count = await this.supplierModel.countDocuments(filter);
    const totalPages = Math.ceil(count / limit);

    const supplierIds = suppliers.map((supplier) => supplier._id);
    const productCounts = await this.productModel.aggregate([
      {
        $match: {
          supplier: { $in: supplierIds },
        },
      },
      {
        $group: {
          _id: '$supplier',
          productsCount: { $sum: 1 },
        },
      },
      {
        $project: {
          supplier: '$_id',
          productsCount: 1,
          _id: 0,
        },
      },
    ]);

    const productsMap = productCounts.reduce((acc, curr) => {
      acc[curr.supplier] = curr.productsCount;
      return acc;
    }, {});

    const suppliersData = suppliers.map((supplier: SupplierDocument) => ({
      ...supplier.toObject(),
      totalProducts: productsMap[supplier._id.toString()] || 0,
    }));

    return {
      docs: suppliersData,
      page,
      limit,
      totalItems: count,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  }

  async findOne(id: string): Promise<any> {
    const supplier = await this.supplierModel.findOne({ _id: id }).lean();

    if (!supplier) {
      throw new NotFoundException("Supplier doesn't exist");
    }

    const totalProducts = await this.productModel.countDocuments({
      supplier: supplier._id,
    });

    return { ...supplier, totalProducts };
  }

  async findById(id: string) {
    return await this.supplierModel.findById(id);
  }

  async delete(id: string) {
    const supplier = await this.supplierModel.findByIdAndDelete(id);

    if (!supplier) {
      throw new UnprocessableEntityException("Supplier doesn't exist");
    }

    //TODO: delete supplier product, category, subcateogory

    return supplier;
  }

  async getProductsBySupplier(id: string, query: FilterProductQueryDto) {
    const page = query.page ? Number(query.page) : 1;
    const limit = query.limit ? Number(query.limit) : 15;

    const filter: Record<string, any> = { 'supplier._id': new ObjectId(id) };
    const sort: Record<string, any> = { createdAt: -1 };

    if (query.category) {
      Object.assign(filter, {
        'category.name': { $regex: new RegExp(query.category, 'gi') },
      });
    }

    if (query.subCategory) {
      Object.assign(filter, {
        'subCategory.name': { $regex: new RegExp(query.subCategory, 'gi') },
      });
    }

    if (query.search) {
      Object.assign(filter, {
        'product.name': { $regex: new RegExp(query.search, 'gi') },
      });
    }

    const products = await this.productModel.aggregate([
      {
        $lookup: {
          from: 'suppliers',
          localField: 'supplier',
          foreignField: '_id',
          as: 'supplier',
        },
      },
      {
        $unwind: {
          path: '$supplier',
        },
      },
      {
        $lookup: {
          from: 'productcategories',
          localField: 'category',
          foreignField: '_id',
          as: 'category',
        },
      },
      {
        $unwind: {
          path: '$category',
        },
      },
      {
        $lookup: {
          from: 'productsubcategories',
          localField: 'subCategory',
          foreignField: '_id',
          as: 'subCategory',
        },
      },
      {
        $unwind: {
          path: '$subCategory',
        },
      },
      {
        $match: {
          ...filter,
        },
      },
      {
        $skip: limit * (page - 1),
      },
      {
        $limit: limit,
      },
      {
        $sort: {
          ...sort,
        },
      },
    ]);

    const count = await this.productModel.aggregate([
      {
        $lookup: {
          from: 'suppliers',
          localField: 'supplier',
          foreignField: '_id',
          as: 'supplier',
        },
      },
      {
        $unwind: {
          path: '$supplier',
        },
      },
      {
        $lookup: {
          from: 'productcategories',
          localField: 'category',
          foreignField: '_id',
          as: 'category',
        },
      },
      {
        $unwind: {
          path: '$category',
        },
      },
      {
        $lookup: {
          from: 'productsubcategories',
          localField: 'subCategory',
          foreignField: '_id',
          as: 'subCategory',
        },
      },
      {
        $unwind: {
          path: '$subCategory',
        },
      },
      {
        $match: {
          ...filter,
        },
      },
      {
        $count: 'count',
      },
    ]);
    const totalPages = Math.ceil(count[0].count / limit);

    return {
      docs: products,
      page,
      limit,
      nextPage: page < totalPages ? page + 1 : null,
      prevPage: page > 1 ? page - 1 : null,
      totalItems: count[0].count,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
    };
  }

  async updateSupplier(id: string, updateSupplierDto: UdpateSupplierDto) {
    const supplier = await this.supplierModel.findByIdAndUpdate(
      id,
      updateSupplierDto,
      {
        new: true,
      },
    );

    if (!supplier) {
      throw new NotFoundException("Supplier doesn't exist");
    }

    return supplier;
  }

  async getSubCategoriesBySupplier(id: string, query: FetchtQueryDto) {
    const page = query.page ? Number(query.page) : 1;
    const limit = query.limit ? Number(query.limit) : 15;

    let filter: Record<string, any> = {
      'supplier._id': new ObjectId(id),
    };
    const sort: Record<string, any> = { createdAt: -1 };

    if (query.query) {
      Object.assign(filter, {
        name: { $regex: new RegExp(query.query, 'gi') },
      });
    }

    const subCategories = await this.productSubCategoryModel.aggregate([
      {
        $lookup: {
          from: 'productcategories',
          localField: 'category',
          foreignField: '_id',
          as: 'category',
        },
      },
      {
        $unwind: {
          path: '$category',
        },
      },
      {
        $lookup: {
          from: 'suppliers',
          localField: 'category.supplier',
          foreignField: '_id',
          as: 'supplier',
        },
      },
      {
        $unwind: {
          path: '$supplier',
        },
      },
      {
        $match: {
          ...filter,
        },
      },
      {
        $project: {
          _id: 1,
          category: 1,
          name: 1,
          isActive: 1,
          status: 1,
        },
      },
      {
        $skip: limit * (page - 1),
      },
      {
        $limit: limit,
      },
      {
        $sort: {
          ...sort,
        },
      },
    ]);

    const count = await this.productSubCategoryModel.aggregate([
      {
        $lookup: {
          from: 'productcategories',
          localField: 'category',
          foreignField: '_id',
          as: 'category',
        },
      },
      {
        $unwind: {
          path: '$category',
        },
      },
      {
        $lookup: {
          from: 'suppliers',
          localField: 'category.supplier',
          foreignField: '_id',
          as: 'supplier',
        },
      },
      {
        $unwind: {
          path: '$supplier',
        },
      },
      {
        $match: {
          ...filter,
        },
      },
      {
        $project: {
          _id: 1,
          category: 1,
          name: 1,
          isActive: 1,
          status: 1,
        },
      },
      {
        $skip: limit * (page - 1),
      },
      {
        $limit: limit,
      },
      {
        $sort: {
          ...sort,
        },
      },
      {
        $count: 'count',
      },
    ]);
    const totalPages = Math.ceil(count[0].count / limit);

    return {
      docs: subCategories,
      page,
      limit,
      nextPage: page < totalPages ? page + 1 : null,
      prevPage: page > 1 ? page - 1 : null,
      totalItems: count[0].count,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
    };
  }

  async updateSuppliers(payload: UdpateSuppliersDto) {
    const { ids, ...rest } = payload;
    const idsMap = ids.map((id) => new ObjectId(id));
    return await this.supplierModel.updateMany({ _id: { $in: idsMap } }, rest, {
      new: true,
    });
  }

  async updateCategory(
    id: string,
    supplierId: string,
    updateCategoryDto: UpdateCategoryDto,
  ) {
    const category = await this.productCategoryModel.findOneAndUpdate(
      { _id: id, supplier: new ObjectId(supplierId) },
      updateCategoryDto,
      { new: true },
    );

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async updateSubCategory(
    id: string,
    supplierId: string,
    updateSubCategoryDto: UpdateSubCategoryDto,
  ): Promise<ProductSubCategory> {
    const subCategory = await this.productSubCategoryModel.aggregate([
      {
        $lookup: {
          from: 'productcategories',
          localField: 'category',
          foreignField: '_id',
          as: 'category',
        },
      },
      {
        $unwind: {
          path: '$category',
        },
      },
      {
        $match: {
          _id: new ObjectId(id),
          'category.supplier': new ObjectId(supplierId),
        },
      },
      {
        $set: {
          ...updateSubCategoryDto,
        },
      },
    ]);

    if (!subCategory.length) {
      throw new NotFoundException('Subcategory not found');
    }

    return subCategory[0];
  }

  async updateCategories(
    supplierId: string,
    updateCategoryDto: UpdateCategoriesDto,
  ) {
    const { ids, ...rest } = updateCategoryDto;
    const idsMap = ids.map((id) => new ObjectId(id));
    return await this.productCategoryModel.updateMany(
      { _id: { $in: idsMap }, supplier: new ObjectId(supplierId) },
      rest,
      { new: true },
    );
  }

  async updateSubCategories(
    supplierId: string,
    updateSubCategoryDto: UpdateSubCategoriesDto,
  ) {
    const { ids, ...rest } = updateSubCategoryDto;
    const idsMap = ids.map((id) => new ObjectId(id));

    const updatedSubCategories = await this.productSubCategoryModel.aggregate([
      {
        $lookup: {
          from: 'productcategories',
          localField: 'category',
          foreignField: '_id',
          as: 'category',
        },
      },
      {
        $unwind: {
          path: '$category',
        },
      },
      {
        $lookup: {
          from: 'suppliers',
          localField: 'category.supplier',
          foreignField: '_id',
          as: 'supplier',
        },
      },
      {
        $unwind: {
          path: '$supplier',
        },
      },
      {
        $match: {
          _id: { $in: [...idsMap] },
          'supplier._id': new ObjectId(supplierId),
        },
      },
      {
        $set: {
          ...rest,
        },
      },
    ]);

    return updatedSubCategories;
  }
}
