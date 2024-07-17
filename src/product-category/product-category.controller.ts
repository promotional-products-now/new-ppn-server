import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { ProductCategoryService } from './product-category.service';
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { UpdateCategoryDto } from 'src/product/dto/update-product.dto';
import { ProductCategory } from './schemas/category.schema';
import { UpdateSubCategoryDto } from './dto/update-product-category.dto';
import { ProductSubCategory } from './schemas/subCategory.schema';
import {
  PaginatedCategoryResponse,
  PaginatedSubCategoryResponse,
} from './dto/paginated-response.dto';
import { FetchtQueryDto } from './dto/fetch-query.dto';

@Controller('product-category')
@ApiTags('product-category')
export class ProductCategoryController {
  constructor(
    private readonly productCategoryService: ProductCategoryService,
  ) {}

  @Get()
  findAll() {
    return this.productCategoryService.findAll();
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
    return await this.productCategoryService.findSuppliersCategories(id, query);
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
    return await this.productCategoryService.findSubCategoriesByCategory(
      id,
      query,
    );
  }

  @ApiParam({ name: 'categoryName', type: 'string', required: true })
  @Get('/:categoryName')
  findSubCategories(@Param('categoryName') categoryName: string) {
    console.log({ categoryName });
    return this.productCategoryService.findAllSubCategory(categoryName);
  }

  @Patch('/:id')
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
    return await this.productCategoryService.updateCategory(id, body);
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
    return await this.productCategoryService.updateSubCategory(id, body);
  }
}
