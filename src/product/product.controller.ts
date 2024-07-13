import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ProductService } from './product.service';
import {
  FilterProductByCategoryQueryDto,
  FilterProductQueryDto,
} from './dto/filter-product-query.dto';

@Controller('products')
@ApiTags('product')
export class ProductController {
  constructor(private readonly productsService: ProductService) {}

  @Get()
  @ApiQuery({ type: FilterProductQueryDto })
  async findAll(@Query() query) {
    return await this.productsService.findAll(query);
  }

  @Get('/populate')
  async populateDatabase() {
    return this.productsService.populateDatabase();
  }

  @Get('/categories')
  async findAllProductCategory() {
    return await this.productsService.findAllProductCategory();
  }

  @Get('/categories/:categoryName')
  @ApiQuery({ type: FilterProductByCategoryQueryDto })
  @ApiParam({ name: 'categoryName', type: 'string', required: true })
  async findProductByCategory(
    @Query() query,
    @Param('categoryName') categoryName: string,
  ) {
    return await this.productsService.findProductByCategory(
      query,
      categoryName,
    );
  }
  @Get('/:id')
  @ApiParam({ name: 'id', type: 'string', required: true })
  async findById(@Param('id') id: string) {
    return await this.productsService.findById(id);
  }

  @Get('/query/suppliers')
  async findSuppliers() {
    return await this.productsService.findSuppliers();
  }
}
