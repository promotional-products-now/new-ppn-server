import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { ProductService } from './product.service';
import {
  FilterProductByCategoryQueryDto,
  FilterProductQueryDto,
} from './dto/filter-product-query.dto';
import { FetchtQueryDto } from './dto/fetch-query.dto';
import { PaginatedSupplierResponse } from './dto/paginated-response.dto';
import { UdpateSupplierDto, UpdateProductDto } from './dto/update-product.dto';
import { Product } from './schemas/product.schema';
import { Supplier } from './schemas/supplier.schema';

@Controller('products')
@ApiTags('product')
export class ProductController {
  constructor(private readonly productsService: ProductService) {}

  @Get()
  @ApiQuery({ type: FilterProductQueryDto })
  async findAll(@Query() query) {
    return await this.productsService.findAll(query);
  }

  @Get('/categories/:categoryName')
  @ApiQuery({ type: FilterProductByCategoryQueryDto })
  @ApiParam({ name: 'categoryName', type: 'string', required: true })
  async findProductByCategory(
    @Query() query,
    @Param('categoryName') categoryName: string,
  ) {
    console.log({query,categoryName})
    return await this.productsService.findProductByCategory(
      query,
      categoryName,
    );
  }

  @Get('/suppliers')
  @ApiOperation({ summary: 'Fetch suppliers' })
  @ApiOkResponse({
    description: 'Fetched suppliers data',
    type: PaginatedSupplierResponse,
  })
  async findSuppliers(@Query() query: FetchtQueryDto) {
    return await this.productsService.findSuppliers(query);
  }

  @Get('/:id')
  @ApiParam({ name: 'id', type: 'string', required: true })
  async findById(@Param('id') id: string) {
    return await this.productsService.findById(id);
  }

  @Patch('/:id')
  @ApiParam({ name: 'id', type: 'string', required: true })
  @ApiOperation({ summary: 'Update Product' })
  @ApiOkResponse({ description: 'Updated product data', type: Product })
  async updateProduct(@Param('id') id: string, @Body() body: UpdateProductDto) {
    return await this.productsService.updateProduct(id, body);
  }

  @Patch('/supplier/:id')
  @ApiParam({ name: 'id', type: 'string', required: true })
  @ApiOperation({ summary: 'Update Supplier' })
  @ApiOkResponse({ description: 'Updated supplier data', type: Supplier })
  async updateSupplier(
    @Param('id') id: string,
    @Body() body: UdpateSupplierDto,
  ) {
    return await this.productsService.updateSupplier(id, body);
  }
}
