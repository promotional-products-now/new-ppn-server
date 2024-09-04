import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';
import { retry } from 'rxjs/operators';
import { AxiosError } from 'axios';
import { Supplier, SupplierDocument } from './schemas/supplier.schema';
import { Addition, AdditionDocument } from './schemas/addition.schema';
import { BasePrice, BasePriceDocument } from './schemas/baseprice.schema';
import { ConfigService } from '@nestjs/config';
import { PRODUCT_FILTER } from './constants';
import {
  FilterPage,
  FilterProductByCategoryQueryDto,
  FilterProductQueryDto,
  FilterShowCaseQueryDto,
  TopSellingProductQuery,
} from './dto/filter-product-query.dto';
import {
  ProductCategory,
  ProductCategoryDocument,
} from '../product-category/schemas/category.schema';
import {
  ProductSubCategory,
  ProductSubCategoryDocument,
} from '../product-category/schemas/subCategory.schema';
import {
  FilterWithCreatedAt,
  UdpateSupplierDto,
  UpdateProductDto,
} from './dto/update-product.dto';
import { FetchtQueryDto } from './dto/fetch-query.dto';
import { ObjectId } from 'mongodb';
import { Order, OrderDocument } from 'src/order/schemas/order.schema';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class ProductService {
  private logger = new Logger(ProductService.name);

  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,

    @InjectModel(Supplier.name)
    private readonly supplierModel: Model<SupplierDocument>,

    @InjectModel(Addition.name)
    private readonly additionModel: Model<AdditionDocument>,

    @InjectModel(BasePrice.name)
    private readonly basePriceModel: Model<BasePriceDocument>,

    @InjectModel(ProductCategory.name)
    private readonly productCategoryModel: Model<ProductCategoryDocument>,

    @InjectModel(ProductSubCategory.name)
    private readonly productSubCategoryModel: Model<ProductSubCategoryDocument>,

    private readonly httpService: HttpService,
    private readonly configService: ConfigService,

    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,
  ) {}

  private async createProduct(product: any) {
    const supplier = await this.supplierModel.findOneAndUpdate(
      {
        name: product.supplier.supplier,
        supplierId: product.supplier.supplier_id,
      },
      {
        name: product.supplier.supplier,
        supplierId: product.supplier.supplier_id,
        country: product.supplier.supplier_country,
        appaMemberNumber: product.supplier.supplier_appa_member_number,
      },
      { upsert: true, new: true },
    );

    const category = await this.productCategoryModel.findOneAndUpdate(
      {
        name: product.product.categorisation.supplier_category,
        supplier: supplier._id,
      },
      {
        name: product.product.categorisation.supplier_category,
        supplier: supplier._id,
      },
      { upseert: true, new: true },
    );

    const subCategory = await this.productSubCategoryModel.findOneAndUpdate(
      {
        name: product.product.categorisation.supplier_subcategory,
        category: category._id,
      },
      {
        name: product.product.categorisation.supplier_subcategory,
        category: category._id,
      },
      {
        upsert: true,
        new: true,
      },
    );

    const payload = {
      meta: {
        id: product.meta.id,
        country: product.meta.country,
        dataSource: product.meta.data_source,
        discontinued: product.meta.discontinued,
        discontinuedAt: product.meta.discontinued_at
          ? new Date(product.meta.discontinued_at).toISOString()
          : null,
        firstListedAt: new Date(product.meta.first_listed_at).toISOString(),
        lastChangedAt: new Date(product.meta.last_changed_at).toISOString(),
        priceCurrencies: product.meta.price_currencies,
        pricesChangedAt: new Date(product.meta.prices_changed_at).toISOString(),
        discontinuedReason: product.meta.discontinued_reason,
        canCheckStock: product.meta.can_check_stock,
        sourceDataChangedAt: new Date(
          product.meta.source_data_changed_at,
        ).toISOString(),
      },
      overview: {
        name: product.overview.name,
        code: product.overview.code,
        suppllier: supplier._id,
        heroImage: product.overview.hero_image,
        minQty: product.overview.min_qty,
        displayPrices: product.overview.display_prices,
      },
      supplier: supplier._id,
      product: {
        code: product.product.code,
        name: product.product.name,
        details: product.product.details,
        description: product.product.description,
        discontinued: product.product.discontinued,
        supplierBrand: product.product.supplier_brand,
        supplierLabel: product.product.supplier_label,
        supplierCatalogue: product.product.supplier_catalogue,
        supplierWebsitePage: product.product.supplier_website_page,
        images: product.product.images ?? [],
        videos: product.product.videos ?? [],
        lineArt: product.product.line_art ?? [],
        colours: {
          list: product.product.colours.list.map((v: any) => ({
            for: v.for,
            name: v.name,
            image: v.image,
            swatch: v.swatch,
            colours: v.colours,
            appColours: v.app_colours,
          })),
          supplierText: product.product.colours.supplier_text,
        },
        categorisation: {
          productType: {
            typeId: product.product.categorisation.product_type.type_id,
            typeName: product.product.categorisation.product_type.type_name,
            typeGroupId:
              product.product.categorisation.product_type.type_group_id,
            typeNameText:
              product.product.categorisation.product_type.type_name_text,
            typeGroupName:
              product.product.categorisation.product_type.type_group_name,
          },
          appaAttributes: product.product.categorisation.appa_attributes,
          appaProductType: {
            healthAndPersonal:
              product.product.categorisation.appa_product_type[
                'Health & Personal'
              ] ?? [],
          },
          supplierCategory: product.product.categorisation.supplier_category,
          supplierSubcategory:
            product.product.categorisation.supplier_subcategory,
        },
        prices: {
          addons: product.product.prices.addons ?? [],
          priceTags: {
            leadTime: product.product.prices.price_tags.lead_time ?? [],
            decoration: product.product.prices.price_tags.decoration ?? [],
          },
          priceGroups: await Promise.all(
            product.product.prices.price_groups.map(async (v: any) => {
              const additions = await Promise.all(
                v.additions.map(async (addition: any) => {
                  const data = await this.additionModel.findOneAndUpdate(
                    { key: addition.key },
                    {
                      key: addition.key,
                      type: addition.type,
                      setup: addition.setup,
                      currency: addition.currency,
                      leadTime: addition.lead_time,
                      description: addition.description,
                      undecorated: addition.undecorated,
                      priceBreaks: addition.price_breaks,
                    },
                    { upsert: true, new: true },
                  );
                  return data._id;
                }),
              );
              const basePriceData = await this.basePriceModel.findOneAndUpdate(
                { key: v.base_price.key },
                {
                  key: v.base_price.key,
                  type: v.base_price.type,
                  setup: v.base_price.setup,
                  indent: v.base_price.indent,
                  currency: v.base_price.currency,
                  leadTime: v.base_price.lead_time,
                  description: v.base_price.description,
                  undecorated: v.base_price.undecorated,
                  priceBreaks: v.base_price.price_breaks,
                },
                { upsert: true, new: true },
              );
              return {
                additions,
                basePrice: basePriceData._id,
              };
            }),
          ),
          currencyOptions: product.product.prices.currency_options,
        },
      },
      subCategory: subCategory._id,
      category: category._id,
    };

    const newProduct = await this.productModel.findOneAndUpdate(
      {
        'product.code': product.product.code,
        'product.name': product.product.name,
      },
      { ...payload },
      { upsert: true, new: true },
    );

    this.logger.log(`Product ${newProduct._id} creatd successfully`);
    return newProduct;
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    timeZone: 'UTC',
  })
  async fetchAndUpsertProducts() {
    let page = 1;
    let totalPages = 1;

    do {
      try {
        const response = await this.fetchProductsFromApi(page);
        const { data, total_pages } = response;
        totalPages = total_pages;

        for (const product of data) {
          await this.createProduct(product);
        }

        this.logger.log(`Page ${page} processed.`);
        page++;
      } catch (error) {
        this.logger.error('Failed to fetch or upsert products', error);
        break;
      }
    } while (page <= totalPages);

    this.logger.log('Product sync completed.');
  }

  private async fetchProductsFromApi(page: number): Promise<any> {
    const apiUrl = this.configService.getOrThrow<string>('promoDataProductApi');
    const authToken =
      this.configService.getOrThrow<string>('PromoDataAuthToken');

    return firstValueFrom(
      this.httpService
        .get(`${apiUrl}?page=${page}`, {
          headers: {
            'x-auth-token': authToken,
          },
        })
        .pipe(
          retry({ count: 5, delay: 2000 }),
          catchError((error: AxiosError) => {
            this.logger.error(`Failed to fetch page ${page}: ${error.message}`);
            throw error;
          }),
        ),
    ).then((response) => response.data);
  }

  async findAll(query: Partial<FilterProductQueryDto>): Promise<any> {
    const page = query.page ? Number(query.page) : 1;
    const limit = query.limit ? Number(query.limit) : 15;

    const filterQuery: Record<string, any> = {
      ...(!query.isAdmin && { isActive: true }),
      'supplier.isActive': true,
      'category.isActive': true,
      'subCategory.isActive': true,
    };

    let sort = {};

    if (query.category) {
      Object.assign(filterQuery, {
        'category.name': { $regex: new RegExp(query.category, 'gi') },
      });
    }

    if (query.subCategory) {
      Object.assign(filterQuery, {
        'subCategory.name': { $regex: new RegExp(query.subCategory, 'gi') },
      });
    }

    if (query.colours && query.colours.length > 0) {
      Object.assign(filterQuery, {
        'product.colours.list': {
          $elemMatch: {
            colours: { $in: query.colours },
          },
        },
      });
    }

    if (query.search) {
      Object.assign(filterQuery, {
        $or: [
          { 'product.name': { $regex: new RegExp(query.search, 'gi') } },
          { 'product.code': { $regex: new RegExp(query.search, 'gi') } },
        ],
      });
    }

    if (query.suppliers) {
      Object.assign(filterQuery, {
        'supplier._id': {
          $in: query.suppliers.map((vendor) => new ObjectId(vendor)),
        },
      });
    }

    if (query && query.filter && query.filter.length > 0) {
      for (const filterValue of query.filter) {
        switch (filterValue) {
          case PRODUCT_FILTER.ITEMS_WITH_IMAGE:
            Object.assign(filterQuery, {
              'product.images': { $exists: true, $ne: [] },
            });
            break;
          case PRODUCT_FILTER.ITEMS_WITH_DESCRIPTION:
            Object.assign(filterQuery, {
              'product.description': { $exists: true, $ne: '' },
            });
            break;
          case PRODUCT_FILTER.ITEMS_WITH_DETAILS:
            Object.assign(filterQuery, {
              'product.details': { $exists: true, $ne: [] },
            });
            break;
          case PRODUCT_FILTER.ITEMS_FROM_API_SUPPLIERS:
            break;
          case PRODUCT_FILTER.NEW_ITEMS_LAST_30_DAYS:
            const currentDate = new Date();
            currentDate.setDate(currentDate.getDate() - 30);
            Object.assign(filterQuery, {
              'meta.firstListedAt': { $gte: currentDate },
            });
            break;
          default:
            this.logger.log('not implemented');
        }
      }
    }

    switch (query.sort) {
      case 'A-Z':
        sort = { 'product.name': 1 };
        break;
      case 'Z-A':
        sort = { 'product.name': -1 };
        break;
      case 'Recently added':
        sort = { 'meta.firstListedAt': -1 };
        break;
      default:
        sort = { createdAt: -1 };
    }

    // Execute both aggregations in parallel using Promise.all
    const [products, count] = await Promise.all([
      this.productModel.aggregate([
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
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $unwind: {
            path: '$product.prices.priceGroups',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'baseprices',
            localField: 'product.prices.priceGroups.basePrice',
            foreignField: '_id',
            as: 'product.prices.priceGroups.basePrice',
          },
        },
        {
          $unwind: {
            path: '$product.prices.priceGroups.basePrice',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'additions',
            localField: 'product.prices.priceGroups.additions',
            foreignField: '_id',
            as: 'product.prices.priceGroups.additions',
          },
        },
        {
          $unwind: {
            path: '$product.prices.priceGroups.additions',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $group: {
            _id: {
              productId: '$_id',
              priceGroupId: '$product.prices.priceGroups._id',
            },
            doc: { $first: '$$ROOT' },
            basePrice: { $first: '$product.prices.priceGroups.basePrice' },
            additions: { $push: '$product.prices.priceGroups.additions' },
          },
        },
        {
          $group: {
            _id: '$_id.productId',
            doc: { $first: '$doc' },
            priceGroups: {
              $push: {
                _id: '$_id.priceGroupId',
                basePrice: '$basePrice',
                additions: '$additions',
              },
            },
          },
        },
        {
          $addFields: {
            'doc.product.prices.priceGroups': '$priceGroups',
          },
        },
        {
          $replaceRoot: { newRoot: '$doc' },
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
            preserveNullAndEmptyArrays: true,
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
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $match: {
            ...filterQuery,
          },
        },
        {
          $sort: {
            ...sort,
          },
        },

        {
          $skip: limit * (page - 1),
        },
        {
          $limit: limit,
        },
        {
          $project: {
            firstListedAt: 0,
            pricesCurrencies: 0,
            updatedAt: 0,
            createdAt: 0,
            overview: { displayPrices: 0 },
            product: { name: 0, code: 0 },
            videos: 0,
            categorisation: {
              productType: { typeId: 0, typeGroupId: 0 },
            },
            category: { supplier: 0, isActive: 0, status: 0, totalProducts: 0 },
            subCategory: { supplier: 0, isActive: 0, status: 0 },
            supplier: { isActive: 0, status: 0, updatedAt: 0, createdAt: 0 },
          },
        },
      ]),

      this.productModel.aggregate([
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
            ...filterQuery,
          },
        },
        {
          $count: 'count',
        },
      ]),
    ]);

    const totalPages =
      count && count[0] ? Math.ceil(count[0].count / limit) : 0;

    return {
      docs: products,
      page: page,
      limit: limit,
      totalItems: count && count[0] ? count[0].count : 0,
      totalPages,
      nextPage: page < totalPages ? page + 1 : null,
      prevPage: page > 1 ? page - 1 : null,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  }

  async findById(id: string) {
    return await this.productModel
      .findById(id)
      .populate('supplier')
      .populate('product.prices.priceGroups.additions')
      .populate('product.prices.priceGroups.basePrice')
      .populate('category')
      .populate('subCategory')
      .exec();
  }

  async fetchUpdatedProducts(query: Partial<FilterWithCreatedAt>) {
    const page = query.page ? Number(query.page) : 1;
    const limit = query.limit ? Number(query.limit) : 15;

    const filterQuery: Record<string, any> = {
      'supplier.isActive': true,
      'category.isActive': true,
      'subCategory.isActive': true,
    };

    if (query.category) {
      filterQuery['category.name'] = {
        $regex: new RegExp(query.category, 'gi'),
      };
    }

    if (query.subCategory) {
      filterQuery['subCategory.name'] = {
        $regex: new RegExp(query.subCategory, 'gi'),
      };
    }

    if (query.suppliers) {
      filterQuery['supplier._id'] = {
        $in: query.suppliers.map((vendor) => new ObjectId(vendor)),
      };
    }

    const from = query.startDate ? new Date(query.startDate) : null;
    const to = query.endDate ? new Date(query.endDate) : null;

    const [products, count] = await Promise.all([
      this.productModel.aggregate([
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
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $unwind: {
            path: '$product.prices.priceGroups',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'baseprices',
            localField: 'product.prices.priceGroups.basePrice',
            foreignField: '_id',
            as: 'product.prices.priceGroups.basePrice',
          },
        },
        {
          $unwind: {
            path: '$product.prices.priceGroups.basePrice',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $group: {
            _id: {
              productId: '$_id',
              priceGroupId: '$product.prices.priceGroups._id',
            },
            doc: { $first: '$$ROOT' },
            basePrice: { $first: '$product.prices.priceGroups.basePrice' },
          },
        },
        {
          $group: {
            _id: '$_id.productId',
            doc: { $first: '$doc' },
            priceGroups: {
              $push: {
                _id: '$_id.priceGroupId',
                basePrice: '$basePrice',
              },
            },
          },
        },
        {
          $addFields: {
            'doc.product.prices.priceGroups': '$priceGroups',
          },
        },
        {
          $replaceRoot: { newRoot: '$doc' },
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
            preserveNullAndEmptyArrays: true,
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
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $match: {
            ...filterQuery,
            updatedAt: { $gte: from, $lte: to },
          },
        },
        {
          $sort: { updatedAt: -1 },
        },
        {
          $skip: limit * (page - 1),
        },
        {
          $limit: limit,
        },
        {
          $project: {
            firstListedAt: 0,
            pricesCurrencies: 0,
            createdAt: 0,
            overview: { displayPrices: 0 },
            product: { name: 0, code: 0 },
            videos: 0,
            categorisation: {
              productType: { typeId: 0, typeGroupId: 0 },
            },
            category: { supplier: 0, isActive: 0, status: 0, totalProducts: 0 },
            subCategory: { supplier: 0, isActive: 0, status: 0 },
            supplier: { isActive: 0, status: 0, updatedAt: 0, createdAt: 0 },
          },
        },
      ]),

      this.productModel.aggregate([
        {
          $match: {
            ...filterQuery,
            updatedAt: { $gte: from, $lte: to },
          },
        },
        {
          $count: 'count',
        },
      ]),
    ]);

    const totalItems = count && count[0] ? count[0].count : 0;
    const totalPages = totalItems ? Math.ceil(totalItems / limit) : 0;

    return {
      docs: products,
      page: page,
      limit: limit,
      totalItems,
      totalPages,
      nextPage: page < totalPages ? page + 1 : null,
      prevPage: page > 1 ? page - 1 : null,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  }

  async fetchNewProducts(query: Partial<FilterWithCreatedAt>) {
    const page = query.page ? Number(query.page) : 1;
    const limit = query.limit ? Number(query.limit) : 15;

    const filterQuery: Record<string, any> = {
      'supplier.isActive': true,
      'category.isActive': true,
      'subCategory.isActive': true,
    };

    if (query.category) {
      filterQuery['category.name'] = {
        $regex: new RegExp(query.category, 'gi'),
      };
    }

    if (query.subCategory) {
      filterQuery['subCategory.name'] = {
        $regex: new RegExp(query.subCategory, 'gi'),
      };
    }

    if (query.suppliers) {
      filterQuery['supplier._id'] = {
        $in: query.suppliers.map((vendor) => new ObjectId(vendor)),
      };
    }

    const from = query.startDate ? new Date(query.startDate) : null;
    const to = query.endDate ? new Date(query.endDate) : null;

    const [products, count] = await Promise.all([
      this.productModel.aggregate([
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
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $unwind: {
            path: '$product.prices.priceGroups',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'baseprices',
            localField: 'product.prices.priceGroups.basePrice',
            foreignField: '_id',
            as: 'product.prices.priceGroups.basePrice',
          },
        },
        {
          $unwind: {
            path: '$product.prices.priceGroups.basePrice',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $group: {
            _id: {
              productId: '$_id',
              priceGroupId: '$product.prices.priceGroups._id',
            },
            doc: { $first: '$$ROOT' },
            basePrice: { $first: '$product.prices.priceGroups.basePrice' },
          },
        },
        {
          $group: {
            _id: '$_id.productId',
            doc: { $first: '$doc' },
            priceGroups: {
              $push: {
                _id: '$_id.priceGroupId',
                basePrice: '$basePrice',
              },
            },
          },
        },
        {
          $addFields: {
            'doc.product.prices.priceGroups': '$priceGroups',
          },
        },
        {
          $replaceRoot: { newRoot: '$doc' },
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
            preserveNullAndEmptyArrays: true,
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
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $match: {
            ...filterQuery,
            createdAt: { $gte: from, $lte: to },
          },
        },
        {
          $sort: { createdAt: -1 },
        },
        {
          $skip: limit * (page - 1),
        },
        {
          $limit: limit,
        },
        {
          $project: {
            firstListedAt: 0,
            pricesCurrencies: 0,
            updatedAt: 0,
            overview: { displayPrices: 0 },
            product: { name: 0, code: 0 },
            videos: 0,
            categorisation: {
              productType: { typeId: 0, typeGroupId: 0 },
            },
            category: { supplier: 0, isActive: 0, status: 0, totalProducts: 0 },
            subCategory: { supplier: 0, isActive: 0, status: 0 },
            supplier: { isActive: 0, status: 0, updatedAt: 0, createdAt: 0 },
          },
        },
      ]),

      this.productModel.aggregate([
        {
          $match: {
            ...filterQuery,
            updatedAt: { $gte: from, $lte: to },
          },
        },
        {
          $count: 'count',
        },
      ]),
    ]);

    const totalItems = count && count[0] ? count[0].count : 0;
    const totalPages = totalItems ? Math.ceil(totalItems / limit) : 0;

    return {
      docs: products,
      page: page,
      limit: limit,
      totalItems,
      totalPages,
      nextPage: page < totalPages ? page + 1 : null,
      prevPage: page > 1 ? page - 1 : null,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  }
  /**
   * returns the top selling products. eg (products with most orders)
   *
   * algorithm:
   *  - find all orders that were placed in the last 30 days with status "success"
   *  - group them by product (order document, cartItems.productId)
   *  - sort them in descending order
   * @param query
   */
  async topSellingProducts(query: TopSellingProductQuery) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 15;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const products = await this.orderModel.aggregate([
      {
        $unwind: '$cartItems',
      },
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
          status: 'success',
        },
      },
      {
        $lookup: {
          from: 'products',
          localField: 'cartItems.productId',
          foreignField: '_id',
          as: 'product',
        },
      },
      {
        $unwind: '$product',
      },
      {
        $group: {
          _id: '$product._id',
          count: { $sum: 1 },
          product: { $first: '$product' },
        },
      },
      {
        $sort: {
          count: -1,
        },
      },
      {
        $skip: (page - 1) * limit,
      },
      {
        $limit: limit,
      },
    ]);

    const count = await this.orderModel.aggregate([
      {
        $unwind: '$cartItems',
      },
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
          status: 'success',
        },
      },
      {
        $group: {
          _id: '$cartItems.productId',
          count: { $sum: 1 },
        },
      },
      {
        $count: 'count',
      },
    ]);

    const totalPages =
      count && count[0] ? Math.ceil(count[0].count / limit) : 0;

    return {
      docs: products,
      page: page,
      limit: limit,
      totalItems: count && count[0] ? count[0].count : 0,
      totalPages,
      nextPage: page < totalPages ? page + 1 : null,
      prevPage: page > 1 ? page - 1 : null,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  }

  async productShowCase(
    query: FilterShowCaseQueryDto,
  ): Promise<{ [key: string]: any }> {
    const showCase: { [key: string]: any } = {};

    // Ensure default values for page and limit
    const page = query.page ?? 1;
    const limit = query.limit ?? 15;

    const categoryNames = query.categories ? query.categories.split(',') : [];

    const promises = categoryNames.map(async (categoryName) => {
      const category = await this.productCategoryModel
        .findOne({ name: this.removeSnakeCase(categoryName) })
        .select(['name', 'id'])
        .lean();

      if (!category) {
        throw new NotFoundException(`Category ${categoryName} not found`);
      }

      const sortOptions: { [key: string]: any } = {
        'A-Z': { 'product.name': 1 },
        'Z-A': { 'product.name': -1 },
        'Recently added': { 'meta.firstListedAt': -1 },
        default: { createdAt: -1 },
      };

      const sort = sortOptions['Recently added']; // Default sort can be adjusted as needed

      const products = await this.productModel
        .find({ category: category._id })
        .skip(limit * (page - 1))
        .limit(limit)
        .sort(sort)
        .lean();

      showCase[categoryName] = products;
    });

    await Promise.all(promises);

    return showCase;
  }

  async latestProducts(query: FilterPage): Promise<{ [key: string]: any }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const sortOptions: { [key: string]: any } = {
      'A-Z': { 'product.name': 1 },
      'Z-A': { 'product.name': -1 },
      'Recently added': { 'meta.firstListedAt': -1 },
      default: { createdAt: -1 },
    };

    const sort = sortOptions['Recently added'];

    const products = await this.productModel
      .find()
      .populate('supplier')
      .populate('product.prices.priceGroups.additions')
      .populate('product.prices.priceGroups.basePrice')
      .populate('category')
      .populate('subCategory')
      .skip(limit * (page - 1))
      .limit(limit)
      .sort(sort)
      .lean();

    return products;
  }

  async hotProducts(query: FilterPage): Promise<{ [key: string]: any }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const sortOptions: { [key: string]: any } = {
      'A-Z': { 'product.name': 1 },
      default: { updatedAt: -1 },
    };

    const sort = sortOptions['default'];

    const products = await this.productModel
      .find({ isHot: true })
      .populate('supplier')
      .populate('product.prices.priceGroups.additions')
      .populate('product.prices.priceGroups.basePrice')
      .populate('category')
      .populate('subCategory')
      .skip(limit * (page - 1))
      .limit(limit)
      .sort(sort)
      .lean();

    return products;
  }

  async updateProduct(id: string, updateProductDto: UpdateProductDto) {
    return await this.productModel.findByIdAndUpdate(id, updateProductDto, {
      new: true,
    });
  }

  async updateSupplier(id: string, updateSupplierDto: UdpateSupplierDto) {
    return await this.supplierModel.findByIdAndUpdate(id, updateSupplierDto, {
      new: true,
    });
  }

  async findSuppliers(query: FetchtQueryDto) {
    const { page, limit, query: search, isActive } = query;

    const payload: Record<string, any> = {};

    if (search) {
      const regex = new RegExp(search, 'i');
      payload.name = { $regex: regex };
    }

    if (isActive) {
      payload.isActive = true;
    }

    const suppliers = await this.supplierModel
      .find(payload)
      .skip(limit * (page - 1))
      .limit(limit)
      .sort({ createdAt: -1 });

    const count = await this.supplierModel.countDocuments(payload);
    const totalPages = Math.ceil(count / limit);

    return {
      docs: suppliers,
      page,
      limit,
      totalItems: count,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  }

  // async findAllProductCategory(): Promise<any[]> {
  //   const category = await this.productCategoryModel.find({});

  //   const res = await Promise.all(
  //     category.map(async (obj, i) => {
  //       let totalProducts = obj.totalProducts;

  //       if (totalProducts === null) {
  //         const count = await this.productModel.countDocuments({
  //           category: obj._id,
  //         });
  //         await this.productCategoryModel.updateOne(
  //           { _id: obj._id },
  //           { totalProducts: count },
  //         );
  //         totalProducts = count;
  //       }

  //       // Convert the Mongoose document to a plain JavaScript object
  //       const plainObj = obj.toObject();
  //       delete plainObj.subCategory;

  //       return {
  //         name: plainObj.name,
  //         id: plainObj.id,
  //         _id: plainObj._id,
  //         totalProducts,
  //       };
  //     }),
  //   );

  //   // console.log(res);
  //   return res;
  // }

  async findProductByCategory(
    query: FilterProductByCategoryQueryDto,
    categoryName: string,
  ): Promise<any[]> {
    try {
      const category = await this.productCategoryModel
        .findOne({ name: this.removeSnakeCase(categoryName) })
        .select(['name', 'id'])
        .lean();

      if (!category) {
        throw new NotFoundException('Category not found');
      }

      const sortOptions: { [key: string]: any } = {
        'A-Z': { 'product.name': 1 },
        'Z-A': { 'product.name': -1 },
        'Recently added': { 'meta.firstListedAt': -1 },
        default: { createdAt: -1 },
      };

      const sort = sortOptions[query.sort] || sortOptions.default;

      const products = await this.productModel
        .find({ category: category._id })
        .skip(query.limit * (query.page - 1))
        .limit(query.limit)
        .sort(sort)
        .lean();

      return products;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'An error occurred while fetching products',
      );
    }
  }

  async populateDatabase() {
    const products = [
      {
        meta: {
          id: 1,
          country: 'AU',
          data_source: 'API',
          discontinued: true,
          can_check_stock: false,
          discontinued_at: '2024-05-07 02:42:35 +0000',
          first_listed_at: '2020-07-25 09:22:30 +0000',
          last_changed_at: '2024-05-07 02:42:35 +0000',
          price_currencies: ['AUD'],
          prices_changed_at: '2020-07-25 09:22:30 +0000',
          discontinued_reason: 'No longer in API',
          source_data_changed_at: '2020-07-25 09:22:30 +0000',
          verified_last_3_months: true,
          changed_comparison_timestamp: '2024-05-07 02:42:35 +0000',
        },
        supplier: {
          supplier: 'PromoCollection',
          supplier_id: 1,
          supplier_country: 'AU',
          supplier_appa_member_number: 'S005217',
        },
        overview: {
          name: '',
          code: '22',
          supplier: 'PromoCollection',
          hero_image: null,
          min_qty: 0,
          display_prices: {},
        },
        product: {
          code: '22',
          name: '',
          details: [
            {
              name: 'additional info',
              detail:
                'Lead time is from confirmation of artwork approval. Lead time refers to dispatch, final delivery time will depend on location and type of courier used.  Stock availability: Order fulfillment is dependent on stock availability, and delivery timeframe, of the factories which we work with. Please confirm availability with us before placing your order.  Upon request, we can provide certification documents for the factories that we source our products from. If you have a certain requirement, please mention at the time of quoting, so we can ensure to source from the appropriate factory before commencing the order. If we are required to switch a factory that we source from, to meet a certain requirement, there may be variations in price applicable.',
            },
          ],
          description: '',
          discontinued: true,
          supplier_brand: null,
          supplier_label: null,
          supplier_catalogue: null,
          supplier_website_page: 'https://promocollection.com.au/product/',
          images: [],
          prices: {
            addons: [],
            price_tags: {},
            price_groups: [],
            currency_options: 'AUD|NZD',
          },
          videos: [],
          line_art: [],
          colours: {
            list: [],
            supplier_text: [],
          },
          categorisation: {
            product_type: {
              type_id: null,
              type_name: null,
              type_group_id: null,
              type_name_text: '',
              type_group_name: null,
            },
            appa_attributes: {},
            appa_product_type: {},
            supplier_category: null,
            promodata_attributes: [],
            supplier_subcategory: null,
            promodata_product_type: {
              type_id: null,
              type_name: null,
              type_group_id: null,
              type_name_text: '',
              type_group_name: null,
            },
          },
        },
      },
      {
        meta: {
          id: 2,
          country: 'AU',
          data_source: 'API',
          discontinued: false,
          can_check_stock: false,
          discontinued_at: null,
          first_listed_at: '2020-07-25 09:22:30 +0000',
          last_changed_at: '2024-05-30 13:44:57 +0000',
          price_currencies: ['AUD'],
          prices_changed_at: '2024-04-21 13:19:55 +0000',
          discontinued_reason: null,
          source_data_changed_at: '2024-05-15 13:28:59 +0000',
          verified_last_3_months: true,
          changed_comparison_timestamp: '2024-05-30 13:44:57 +0000',
        },
        supplier: {
          supplier: 'PromoCollection',
          supplier_id: 1,
          supplier_country: 'AU',
          supplier_appa_member_number: 'S005217',
        },
        overview: {
          name: 'Dispenser Stand',
          code: 'PCA041',
          supplier: 'PromoCollection',
          hero_image:
            'https://res.cloudinary.com/promodata/promoc/6d14c4fe7dd9668cf1450b82e3449adf23fcad2a.jpg',
          min_qty: 0,
          display_prices: {},
        },
        product: {
          code: 'PCA041',
          name: 'Dispenser Stand',
          details: [
            {
              name: 'product size',
              detail: '91.4x183cm',
            },
            {
              name: 'product material',
              detail: 'Aluminium alloy and elastic cloth',
            },
            {
              name: 'included packaging',
              detail: 'Standard Box',
            },
            {
              name: 'product dimensions',
              detail:
                'Single weight: 9kg \nG/N Weight: 10kg/9kg \nMeas: 965x280x85mm \nPacking: 1pc/ctn',
            },
            {
              name: 'additional info',
              detail:
                'Lead time is from confirmation of artwork approval. Lead time refers to dispatch, final delivery time will depend on location and type of courier used.  Stock availability: Order fulfillment is dependent on stock availability, and delivery timeframe, of the factories which we work with. Please confirm availability with us before placing your order.  Upon request, we can provide certification documents for the factories that we source our products from. If you have a certain requirement, please mention at the time of quoting, so we can ensure to source from the appropriate factory before commencing the order. If we are required to switch a factory that we source from, to meet a certain requirement, there may be variations in price applicable.',
            },
          ],
          description:
            'The Dispenser Stand is a great way to display your branding, and keep safe. The cover of the stand is fully customisable with a full colour print design. The stand of the dispenser can fixed at a position about 1 meter above the ground, and can be placed and moved at will, without being restricted by space and layout. Made of aluminium alloy and elastic cloth, it is stable and firm and a great branding option.',
          discontinued: false,
          supplier_brand: null,
          supplier_label: null,
          supplier_catalogue: null,
          supplier_website_page:
            'https://promocollection.com.au/product/PCA041',
          images: [
            'https://res.cloudinary.com/promodata/promoc/6d14c4fe7dd9668cf1450b82e3449adf23fcad2a.jpg',
            'https://res.cloudinary.com/promodata/promoc/a304f66ff1913acd462cb1e61ff6eeb8b5f7dfd8.jpg',
            'https://res.cloudinary.com/promodata/promoc/55570a61c4cf2002915e7e033e0de7d17321faff.jpg',
            'https://res.cloudinary.com/promodata/promoc/affb11e3b4d0fc4d51e76d723fe312e1dcaf3910.jpg',
            'https://res.cloudinary.com/promodata/promoc/c8bf8477602ce9638cd713f1c5048d89f1ff6572.jpg',
            'https://res.cloudinary.com/promodata/promoc/b5d14f62afb2feb044afae3b52f1a0974e70cac0.jpg',
            'https://res.cloudinary.com/promodata/promoc/b7eba55038851797259eb03d92d73a4cf95bd7cb.jpg',
          ],
          prices: {
            addons: [],
            price_tags: {},
            price_groups: [
              {
                additions: [],
                base_price: {
                  key: '859303c1fe9c92c2478a7d4febba6a77',
                  tags: [],
                  type: 'Digital Print',
                  setup: 0,
                  indent: false,
                  currency: 'AUD',
                  lead_time: '1 -2week',
                  description:
                    '1 -2week, Single Sides Print, Digital Print, 1 design',
                  undecorated: false,
                  price_breaks: [
                    {
                      qty: 1,
                      price: 151.69,
                    },
                    {
                      qty: 5,
                      price: 149.19,
                    },
                    {
                      qty: 10,
                      price: 146.69,
                    },
                    {
                      qty: 25,
                      price: 144.49,
                    },
                    {
                      qty: 50,
                      price: 142.19,
                    },
                  ],
                },
                promodata_decoration: 'Direct Print: Digital Print',
              },
              {
                additions: [],
                base_price: {
                  key: 'd68a38641c336c31ade84f010ae0cee4',
                  tags: [],
                  type: 'Digital Print',
                  setup: 0,
                  indent: false,
                  currency: 'AUD',
                  lead_time: '1 -2week',
                  description:
                    '1 -2week, Double Sides Print, Digital Print, 1 design',
                  undecorated: false,
                  price_breaks: [
                    {
                      qty: 1,
                      price: 154.89,
                    },
                    {
                      qty: 5,
                      price: 152.59,
                    },
                    {
                      qty: 10,
                      price: 150.29,
                    },
                    {
                      qty: 25,
                      price: 147.59,
                    },
                    {
                      qty: 50,
                      price: 144.89,
                    },
                  ],
                },
                promodata_decoration: 'Direct Print: Digital Print',
              },
            ],
            currency_options: 'AUD|NZD',
          },
          videos: [],
          line_art: [],
          colours: {
            list: [
              {
                for: 'Frame',
                name: 'silver Fabric:PMS',
                image: null,
                swatch: [],
                colours: ['silver Fabric:PMS'],
                appa_colours: [],
              },
            ],
            supplier_text: [
              {
                name: 'colors notes',
                detail: 'Frame:silver Fabric:PMS',
              },
            ],
          },
          categorisation: {
            product_type: {
              type_id: 'H-04',
              type_name: 'Face Masks',
              type_group_id: 'H',
              type_name_text: 'Health & Personal > Face Masks',
              type_group_name: 'Health & Personal',
            },
            appa_attributes: {},
            appa_product_type: {
              'Health & Personal': ['Face Masks'],
            },
            supplier_category: 'Health & Personal',
            promodata_attributes: ['Features: Antibacterial'],
            supplier_subcategory: 'Face Masks',
            promodata_product_type: {
              type_id: 'PL-02',
              type_name: 'Face Masks',
              type_group_id: 'PL',
              type_name_text: 'Health & Personal > Face Masks',
              type_group_name: 'Health & Personal',
            },
          },
        },
      },
    ];
    const docs = await Promise.all(
      products.map(async (product) => {
        const data: ProductDocument = await this.createProduct(product);

        return await this.findById(data._id as string);
      }),
    );

    return { docs };
  }
  removeSnakeCase(str: string): string {
    return str
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}
