import { Module } from '@nestjs/common';
import { ProductCategoryService } from './product-category.service';
import { ProductCategoryController } from './product-category.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from '../product/schemas/product.schema';
import {
  ProductCategory,
  ProductCategorySchema,
} from './schemas/category.schema';
import {
  ProductSubCategory,
  ProductSubCategorySchema,
} from './schemas/subCategory.schema';
import { Supplier, SupplierSchema } from '../product/schemas/supplier.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: ProductCategory.name, schema: ProductCategorySchema },
      { name: ProductSubCategory.name, schema: ProductSubCategorySchema },
      { name: Supplier.name, schema: SupplierSchema },
    ]),
  ],
  controllers: [ProductCategoryController],
  providers: [ProductCategoryService],
})
export class ProductCategoryModule {}
