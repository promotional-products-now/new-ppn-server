import { Controller, Get, Param } from '@nestjs/common';
import { ProductCategoryService } from './product-category.service';
import { ApiParam, ApiTags } from '@nestjs/swagger';

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

  @ApiParam({ name: 'categoryName', type: 'string', required: true })
  @Get('/:categoryName')
  findSubCategories(@Param('categoryName') categoryName: string) {
    console.log({ categoryName });
    return this.productCategoryService.findAllSubCategory(categoryName);
  }
}
