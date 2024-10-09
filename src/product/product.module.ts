import { forwardRef, Module } from '@nestjs/common';
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
} from '../product-category/schemas/category.schema';
import {
  ProductSubCategory,
  ProductSubCategorySchema,
} from '../product-category/schemas/subCategory.schema';
import { JWTModule } from '../commons/services/JWTService/JWTService.module';
import { AuthorizationGuard } from '../commons/guards/authorization.guard';
import { UserModule } from '../user/user.module';
import { SupplierController } from './supplier.controller';
import { SupplierService } from './supplier.service';
import { OrderModule } from 'src/order/order.module';
import { Order, OrderSchema } from 'src/order/schemas/order.schema';

@Module({
  imports: [
    JWTModule,
    OrderModule,

    // FileUploadModule,
    HttpModule,

    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: BasePrice.name, schema: BasePriceSchema },
      { name: Supplier.name, schema: SupplierSchema },
      { name: Addition.name, schema: AdditionSchema },
      { name: ProductCategory.name, schema: ProductCategorySchema },
      { name: ProductSubCategory.name, schema: ProductSubCategorySchema },
      { name: Order.name, schema: OrderSchema },
      // { name: Freight.name, schema: FreightSchema },
    ]),
    forwardRef(() => UserModule),
  ],
  controllers: [ProductController, SupplierController],
  providers: [ProductService, SupplierService, AuthorizationGuard],
  exports: [ProductService],
})
export class ProductModule {}
