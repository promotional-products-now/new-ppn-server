import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import { getModelToken } from '@nestjs/mongoose';
import { Product } from './schemas/product.schema';
import { Supplier } from './schemas/supplier.schema';
import { Addition } from './schemas/addition.schema';
import { BasePrice } from './schemas/baseprice.schema';
import { ProductCategory } from '../product-category/schemas/category.schema';
import { ProductSubCategory } from '../product-category/schemas/subCategory.schema';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { AXIOS_INSTANCE_TOKEN } from './constants';

describe('ProductService', () => {
  let service: ProductService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        HttpService,
        ConfigService,
        {
          provide: getModelToken(Product.name),
          useValue: {},
        },
        {
          provide: getModelToken(Supplier.name),
          useValue: {},
        },
        {
          provide: getModelToken(Addition.name),
          useValue: {},
        },
        {
          provide: getModelToken(BasePrice.name),
          useValue: {},
        },
        { provide: getModelToken(ProductCategory.name), useValue: {} },
        { provide: getModelToken(ProductSubCategory.name), useValue: {} },
        { provide: AXIOS_INSTANCE_TOKEN, useValue: {} },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
