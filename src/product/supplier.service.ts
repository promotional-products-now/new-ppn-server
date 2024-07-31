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
import { UdpateSupplierDto } from './dto/update-supplier.dto';
import { ObjectId } from 'mongodb';

@Injectable()
export class SupplierService {
  constructor(
    @InjectModel(Supplier.name)
    private readonly supplierModel: Model<SupplierDocument>,
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
  ) {}

  async findSuppliers(query: FetchtQueryDto) {
    const page = query.page ? Number(query.page) : 1;
    const limit = query.limit ? Number(query.limit) : 15;

    const filter: Record<string, any> = {};
    const sort: Record<string, any> = { createdAt: -1 };

    if (query.query) {
      filter.$or = [{ name: { $regex: new RegExp(query.query, 'gi') } }];
    }

    const suppliers = await this.supplierModel.find(
      filter,
      {},
      { sort, skip: limit * (page - 1), limit },
    );
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

    const filter: Record<string, any> = { supplier: new ObjectId(id) };
    const sort: Record<string, any> = {};

    const products = await this.productModel.find(
      filter,
      {},
      { sort, skip: limit * (page - 1), limit },
    );
    const count = await this.productModel.countDocuments(filter);
    const totalPages = Math.ceil(count / limit);

    return {
      docs: products,
      page,
      limit,
      totalItems: count,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
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

    if (!updateSupplierDto.isActive) {
      await this.productModel.updateMany(
        { supplier: supplier._id },
        { isActive: supplier.isActive },
      );
    }

    return supplier;
  }
}
