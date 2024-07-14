import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { Product, ProductSchema } from './schemas/product.schema';
import { BasePrice, BasePriceSchema } from './schemas/baseprice.schema';
import { Supplier, SupplierSchema } from './schemas/supplier.schema';
import { Addition, AdditionSchema } from './schemas/addition.schema';
import {
  ProductCategory,
  ProductCategorySchema,
} from './schemas/category.schema';
import { ProductSubCategory, ProductSubCategorySchema } from './schemas/subCategory.schema';

@Module({
  imports: [
    // JWTModule,
    // FileUploadModule,
    HttpModule,
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: BasePrice.name, schema: BasePriceSchema },
      { name: Supplier.name, schema: SupplierSchema },
      { name: Addition.name, schema: AdditionSchema },
      { name: ProductCategory.name, schema: ProductCategorySchema },
      { name: ProductSubCategory.name, schema: ProductSubCategorySchema },
    ]),
  ],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
