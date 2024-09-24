import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
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
  ProductTextSearchQueryDto,
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
import { cleanText, toKebabCase } from '../utils';
import { STATUS_ENUM } from './product.interface';

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
    const slug = `${toKebabCase(product?.overview?.name)}-${product?.overview?.code}-${product?.meta?.id}`;

    const categoryName = product?.product?.categorisation?.product_type
      ?.type_group_name
      ? cleanText(
          product?.product?.categorisation?.product_type?.type_group_name,
        )
      : product?.product?.categorisation?.supplier_category
        ? cleanText(product?.product?.categorisation?.supplier_category)
        : 'uncategorized';

    const subCategoryName =
      product?.product?.categorisation?.product_type?.type_name ||
      product?.product?.categorisation?.supplier_subcategory ||
      'uncategorized';

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
        name: categoryName,
        supplier: supplier._id,
      },
      {
        name: categoryName,
        supplier: supplier._id,
      },
      { upsert: true, new: true },
    );

    const subCategory = await this.productSubCategoryModel.findOneAndUpdate(
      {
        name: subCategoryName,
        category: category._id,
      },
      {
        name: subCategoryName,
        category: category._id,
      },
      {
        upsert: true,
        new: true,
      },
    );

    const payload = {
      meta: {
        id: product?.meta?.id,
        country: product?.meta?.country,
        dataSource: product?.meta?.data_source,
        discontinued: product?.meta?.discontinued,
        discontinuedAt: product?.meta?.discontinued_at || null,
        firstListedAt: product?.meta?.first_listed_at,
        lastChangedAt: product?.meta?.last_changed_at,
        priceCurrencies: product?.meta?.price_currencies,
        pricesChangedAt: product?.meta?.prices_changed_at,
        discontinuedReason: product?.meta?.discontinued_reason,
        canCheckStock: product?.meta?.can_check_stock,
        sourceSataChangedAt: product?.meta?.source_data_changed_at,
        verifiedLast3Months: product?.meta?.verified_last_3_months,
        changedComparisonTimestamp: product?.meta?.changed_comparison_timestamp,
      },
      overview: {
        name: product?.overview?.name,
        code: product?.overview?.code,
        suppllier: supplier._id,
        heroImage: product?.overview?.hero_image,
        minQty: product?.overview?.min_qty,
        displayPrices: product?.overview?.display_prices,
      },
      supplier: supplier._id,
      product: {
        code: product?.product?.code,
        name: product?.product?.name,
        details: product?.product?.details,
        description: product?.product?.description,
        discontinued: product?.product?.discontinued,
        supplierBrand: product?.product?.supplier_brand,
        supplierLabel: product?.product?.supplier_label,
        supplierCatalogue: product?.product?.supplier_catalogue,
        supplierWebsitePage: product?.product?.supplier_website_page,
        images: product?.product?.images ?? [],
        videos: product?.product?.videos ?? [],
        lineArt: product?.product?.line_art ?? [],
        colours: {
          list: product?.product?.colours?.list?.map((v: any) => ({
            for: v?.for,
            name: v?.name,
            image: v?.image,
            swatch: v?.swatch,
            colours: v?.colours,
            appColours: v?.app_colours,
          })),
          supplierText: product?.product?.colours.supplier_text,
        },
        categorisation: {
          productType: {
            typeId: product?.product?.categorisation?.product_type?.type_id,
            typeName: product?.product?.categorisation?.product_type?.type_name,
            typeGroupId:
              product?.product?.categorisation?.product_type?.type_group_id,
            typeNameText:
              product?.product?.categorisation?.product_type?.type_name_text,
            typeGroupName:
              product?.product?.categorisation?.product_type?.type_group_name,
          },
          appaAttributes: product?.product?.categorisation?.appa_attributes,
          appaProductType: {
            healthAndPersonal:
              product?.product?.categorisation?.appa_product_type[
                'Health & Personal'
              ] ?? [],
          },
          supplierCategory: product?.product?.categorisation?.supplier_category,
          supplierSubcategory:
            product?.product?.categorisation?.supplier_subcategory,
        },
        prices: {
          addons: product?.product?.prices.addons ?? [],
          priceTags: {
            leadTime: product?.product?.prices.price_tags?.lead_time ?? [],
            decoration: product?.product?.prices.price_tags?.decoration ?? [],
          },
          priceGroups: await Promise.all(
            product?.product?.prices.price_groups.map(async (v: any) => {
              const additions = await Promise.all(
                v?.additions?.map(async (addition: any) => {
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
                { key: v?.base_price.key },
                {
                  key: v?.base_price?.key,
                  type: v?.base_price?.type,
                  setup: v?.base_price?.setup,
                  indent: v?.base_price?.indent,
                  currency: v?.base_price?.currency,
                  leadTime: v?.base_price?.lead_time,
                  description: v?.base_price?.description,
                  undecorated: v?.base_price?.undecorated,
                  priceBreaks: v?.base_price?.price_breaks,
                },
                { upsert: true, new: true },
              );
              return {
                additions,
                basePrice: basePriceData._id,
              };
            }),
          ),
          currencyOptions: product?.product?.prices?.currency_options,
        },
      },
      slug: slug,
      subCategory: subCategory._id,
      category: category._id,
    };

    const newProduct = await this.productModel.findOneAndUpdate(
      {
        'meta.id': product?.meta.id,
        'meta.country': product?.meta?.country,
        'overview.code': product.overview.code,
      },
      { ...payload },
      { upsert: true, new: true },
    );
    // console.log(payload);

    this.logger.log(`Product ${newProduct._id} creatd successfully`);
    return newProduct;
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    timeZone: 'UTC',
  })
  async fetchAndUpsertProducts() {
    let page = 1;
    let totalPages = 1;
    console.log('start:', page);
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

    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 1);
    const sinceDate = twoDaysAgo.toISOString().split('T')[0];

    return firstValueFrom(
      this.httpService
        .get(`${apiUrl}?page=${page}`, {
          headers: {
            'x-auth-token': authToken,
          },
          data: { since: sinceDate },
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
    const limit = query.limit ? Number(query.limit) : 10;

    const currentDate = new Date();

    const filterQuery: Record<string, any> = {
      ...(!query.isAdmin && { isActive: true }),
      'supplier.isActive': true,
      'category.isActive': true,
      'subCategory.isActive': true,
    };

    if (query.category) {
      filterQuery['category.name'] = new RegExp(query.category, 'i');
    }

    if (query.subCategory) {
      filterQuery['subCategory.name'] = new RegExp(query.subCategory, 'i');
    }

    if (query.colours && query.colours.length > 0) {
      filterQuery['product.colours.list.colours'] = {
        $in: [...query.colours].map((colour) => new RegExp(colour, 'i')),
      };
    }

    if (query.search || (query.minPrice && query.maxPrice)) {
      filterQuery.$and = [];

      if (query.search) {
        filterQuery.$and.push({
          $or: [
            { 'product.name': new RegExp(query.search, 'i') },
            { 'product.code': new RegExp(query.search, 'i') },
          ],
        });
      }

      if (query.minPrice && query.maxPrice) {
        filterQuery.$and.push(
          { 'price.min': { $gte: Number(query.minPrice || 0) } },
          { 'price.max': { $lte: Number(query.maxPrice || 100000) } },
        );
      }
    }

    if (query.suppliers) {
      filterQuery['supplier._id'] = {
        $in: Array.isArray(query.suppliers)
          ? query.suppliers.map((supplier) => new ObjectId(supplier))
          : [new ObjectId(query.suppliers as string)],
      };
    }

    // TODO: WORK ON THE REMAINING IMPLEMENTATION
    if (query && query.filter) {
      for (const filterValue of Array.isArray(query.filter)
        ? query.filter
        : [query.filter]) {
        switch (filterValue) {
          case PRODUCT_FILTER.ITEMS_WITH_DETAILS:
            Object.assign(filterQuery, {
              'product.details': { $exists: true, $ne: [] },
            });
            break;
          case PRODUCT_FILTER.ITEMS_WITH_DESCRIPTION:
            Object.assign(filterQuery, {
              'product.description': { $exists: true, $ne: '' },
            });
            break;
          case PRODUCT_FILTER.NON_DISCONTINUED_PRODUCTS:
            Object.assign(filterQuery, {
              'meta.discontinued': false,
            });
            break;
          case PRODUCT_FILTER.NON_DISCOUNTED_PRODUCTS:
            Object.assign(filterQuery, {
              $and: [
                { 'discounts.diamondRule.reducedMarkup': 0 },
                { 'discounts.goldRule.reducedMarkup': 0 },
                { 'discounts.regularRule.reducedMarkup': 0 },
              ],
            });
            break;
          case PRODUCT_FILTER.NEW_ZEALAND_REGION:
            Object.assign(filterQuery, { 'meta.country': 'NZ' });
            break;

          case PRODUCT_FILTER.ITEMS_WITHOUTOUT_IMAGE:
            Object.assign(filterQuery, {
              'overview.heroImage': null,
            });
            break;
          case PRODUCT_FILTER.ITEM_WITHOUT_CATEGORIES:
            Object.assign(filterQuery, {
              'category.name': 'uncategorized',
            });
            break;
          case PRODUCT_FILTER.ITEMS_WITH_OUT_STOCK_CHECK:
            Object.assign(filterQuery, { 'meta.canCheckStock': false });
            break;
          case PRODUCT_FILTER.ITEMS_FROM_API_SUPPLIERS:
            Object.assign(filterQuery, { 'meta.dataSource': 'API' });
            break;

          case PRODUCT_FILTER.NEW_ITEMS_LAST_30_DAYS:
            currentDate.setDate(currentDate.getDate() - 30);
            Object.assign(filterQuery, {
              'meta.firstListedAt': { $gte: currentDate },
            });
            break;
          case PRODUCT_FILTER.NON_DISCOUNTS_EXPIRING:
            const start = new Date();
            start.setUTCHours(0, 0, 0, 0);

            // Create a new end date that is 3 days after the start date
            const end = new Date(start);
            end.setUTCDate(start.getUTCDate() + 3);
            end.setUTCHours(23, 59, 59, 999);

            Object.assign(filterQuery, {
              $or: [
                {
                  'discounts.diamondRule.expiryDate': {
                    // $gte: start,
                    // $lte: end,
                    $gte: end,
                  },
                },
                {
                  'discounts.goldRule.expiryDate': {
                    $gte: end,
                  },
                },
                {
                  'discounts.regularRule.expiryDate': {
                    $gte: end,
                  },
                },
              ],
            });

            break;
          case PRODUCT_FILTER.BUY_NOW_CANDIDATE:
            Object.assign(filterQuery, { status: STATUS_ENUM.BUY_NOW });
            break;
          case PRODUCT_FILTER.ENABLE_VISIBILITY:
            Object.assign(filterQuery, { isActive: true });
            break;
          case PRODUCT_FILTER.INACTIVE_ITEMS:
            Object.assign(filterQuery, { isActive: false });
            break;
          case PRODUCT_FILTER.ITEM_WITHOUT_PRICES:
            Object.assign(filterQuery, { price: { $exists: false } });
            break;
          default:
            this.logger.log('not implemented');
        }
      }
    }

    const sortOptions = {
      'A-Z': { 'product.name': 1 },
      'Z-A': { 'product.name': -1 },
      'recently added': { 'meta.firstListedAt': -1 },
      'lowest-price': { 'price.min': -1 },
      'higest-price': { 'price.max': -1 },
      default: { createdAt: -1 },
    };

    const sort = sortOptions[query.sort] || sortOptions.default;

    const pipeline = [
      {
        $lookup: {
          from: 'suppliers',
          localField: 'supplier',
          foreignField: '_id',
          as: 'supplier',
        },
      },
      { $unwind: '$supplier' },
      {
        $lookup: {
          from: 'productcategories',
          localField: 'category',
          foreignField: '_id',
          as: 'category',
        },
      },
      { $unwind: '$category' },
      {
        $lookup: {
          from: 'productsubcategories',
          localField: 'subCategory',
          foreignField: '_id',
          as: 'subCategory',
        },
      },
      { $unwind: '$subCategory' },
      { $match: filterQuery },
      { $sort: sort },
      {
        $facet: {
          metadata: [{ $count: 'total' }],
          data: [{ $skip: (page - 1) * limit }, { $limit: limit }],
        },
      },
    ];

    const [result] = await this.productModel.aggregate(pipeline);

    const products = result.data;
    const totalItems = result.metadata[0]?.total || 0;
    const totalPages = Math.ceil(totalItems / limit);

    return {
      docs: products,
      page,
      limit,
      totalItems,
      totalPages,
      nextPage: page < totalPages ? page + 1 : null,
      prevPage: page > 1 ? page - 1 : null,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  }

  async findBySlug(slug: string) {
    const product = await this.productModel
      .findOne({ slug })
      .populate('category')
      .populate('supplier')
      .populate('product.prices.priceGroups.additions')
      .populate('product.prices.priceGroups.basePrice')
      .populate('subCategory')
      .lean();

    return product;
  }

  async findByProductCode(productCode: string) {
    const [product] = await this.productModel.aggregate([
      { $match: { 'overview.code': productCode } },
      {
        $lookup: {
          from: 'baseprices',
          localField: 'product.prices.priceGroups.basePrice',
          foreignField: '_id',
          as: 'product.prices.priceGroups.basePrice',
        },
      },
      { $unwind: '$product.prices.priceGroups.basePrice' },
    ]);

    return product;
  }

  async fetchUpdatedProducts(query: Partial<FilterWithCreatedAt>) {
    const page = query.page ? Number(query.page) : 1;
    const limit = query.limit ? Number(query.limit) : 10;

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

    if (query.category) {
      filterQuery['category.name'] = new RegExp(query.category, 'i');
    }

    if (query.subCategory) {
      filterQuery['subCategory.name'] = new RegExp(query.subCategory, 'i');
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
      isActive: false,
      'supplier.isActive': true,
      'category.isActive': true,
      'subCategory.isActive': true,
    };

    if (query.category) {
      filterQuery['category.name'] = new RegExp(query.category, 'i');
    }

    if (query.subCategory) {
      filterQuery['subCategory.name'] = new RegExp(query.subCategory, 'i');
    }

    if (query.suppliers) {
      filterQuery['supplier._id'] = {
        $in: Array.isArray(query.suppliers)
          ? query.suppliers.map((supplier) => new ObjectId(supplier))
          : [new ObjectId(query.suppliers as string)],
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
    const page = Number(query.page) ?? 1;
    const limit = Number(query.limit) ?? 15;
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
    const page = Number(query.page) ?? 1;
    const limit = Number(query.limit) ?? 15;

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
        .populate({ path: 'category', select: ['name'] })
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
    const page = Number(query.page) ?? 1;
    const limit = Number(query.limit) ?? 10;

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
    const page = Number(query.page) ?? 1;
    const limit = Number(query.limit) ?? 10;

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

  async updateManyProduct(ids: string[], payload) {
    const result = await this.productModel.updateMany(
      { _id: { $in: ids } },
      { $set: payload },
    );
    return result;
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

    const sortOptions: { [key: string]: any } = {
      'A-Z': { name: 1 },
      'Z-A': { name: -1 },
      default: { createdAt: -1 },
    };

    const sort = sortOptions[query.sort] || sortOptions.default;

    const suppliers = await this.supplierModel
      .find(payload)
      .select(
        'name status suppliderId totalProducts isActive country appaMemberNumber',
      )
      .skip(limit * (page - 1))
      .limit(limit)
      .sort(sort)
      .lean();

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
        .skip(Number(query.limit) * (Number(query.page) - 1))
        .limit(Number(query.limit))
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

  async productTextSearch(query: Partial<ProductTextSearchQueryDto>) {
    try {
      const filterQuery: any = {};

      if (query.search) {
        filterQuery.$text = { $search: query.search };
      }

      if (query.colours && query.colours.length > 0) {
        filterQuery['product.colours.list.colours'] = {
          $in: query.colours.map((colour: string) => new RegExp(colour, 'i')),
        };
      }

      const results = await this.productModel
        .find(filterQuery, { score: { $meta: 'textScore' } })
        .select('overview category slug')
        .populate('category')
        .limit(10)
        .sort({ score: { $meta: 'textScore' } })
        .lean()
        .exec();

      return results;
    } catch (error) {
      console.error('Error performing search:', error);
      throw error;
    }
  }

  async productPricingDetails(productId: string) {
    const product = await this.productModel
      .findById(productId)
      .populate('product.prices.priceGroups.additions')
      .populate('product.prices.priceGroups.basePrice')
      .select('product.prices');

    return product;
  }

  removeSnakeCase(str: string): string {
    return str
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}
