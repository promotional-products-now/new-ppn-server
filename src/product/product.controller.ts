import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ProductService } from './product.service';
import { FilterProductQueryDto } from './dto/filter-product-query.dto';

@Controller('products')
@ApiTags("product")
export class ProductController {
  constructor(private readonly productsService: ProductService) {}

  @Get()
  @ApiQuery({ type: FilterProductQueryDto })
  findAll(@Query() query) {
    return this.productsService.findAll(query);
  }

  @Get('/populate')
  async populateDatabase() {
    return this.productsService.populateDatabase();
  }

  @Get('/:id')
  @ApiParam({ name: 'id', type: 'string', required: true })
  async findById(@Param('id') id: string) {
    return this.productsService.findById(id);
  }

  @Get('/query/suppliers')
  findSuppliers() {
    return this.productsService.findSuppliers();
  }
}
