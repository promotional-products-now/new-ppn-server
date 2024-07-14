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
import {
  PaginatedCategoryResponse,
  PaginatedSubCategoryResponse,
  PaginatedSupplierResponse,
} from './dto/paginated-response.dto';
import {
  UdpateSupplierDto,
  UpdateCategoryDto,
  UpdateProductDto,
  UpdateSubCategoryDto,
} from './dto/update-product.dto';
import { Product } from './schemas/product.schema';
import { Supplier } from './schemas/supplier.schema';
import { ProductSubCategory } from './schemas/subCategory.schema';
import { ProductCategory } from './schemas/category.schema';

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

  @Get('/suppliers/:id/category')
  @ApiParam({ name: 'id', type: 'string', required: true })
  @ApiOperation({ summary: 'Fetch supplier categories' })
  @ApiOkResponse({
    description: 'Fetched supplier categories data',
    type: PaginatedCategoryResponse,
  })
  async findSupplierCategories(
    @Param('id') id: string,
    @Query() query: FetchtQueryDto,
  ) {
    return await this.productsService.findSuppliersCategories(id, query);
  }

  @Get('/suppliers/:id/subcategory')
  @ApiParam({ name: 'id', type: 'string', required: true })
  @ApiOperation({ summary: 'Fetch subcategories by category' })
  @ApiOkResponse({
    description: 'Fetched supplier subcategories data',
    type: PaginatedSubCategoryResponse,
  })
  async findSubCategoriesByCategory(
    @Param('id') id: string,
    @Query() query: FetchtQueryDto,
  ) {
    return await this.productsService.findSubCategoriesByCategory(id, query);
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

  @Patch('/category/:id')
  @ApiParam({ name: 'id', type: 'string', required: true })
  @ApiOperation({ summary: 'Update Category' })
  @ApiOkResponse({
    description: 'Updated category data',
    type: ProductCategory,
  })
  async updateCategory(
    @Param('id') id: string,
    @Body() body: UpdateCategoryDto,
  ) {
    return await this.productsService.updateCategory(id, body);
  }

  @Patch('/subcategory/:id')
  @ApiParam({ name: 'id', type: 'string', required: true })
  @ApiOperation({ summary: 'Update SubCategory' })
  @ApiOkResponse({
    description: 'Updated subcategory data',
    type: ProductSubCategory,
  })
  async updateSubCategory(
    @Param('id') id: string,
    @Body() body: UpdateSubCategoryDto,
  ) {
    return await this.productsService.updateSubCategory(id, body);
  }
}
