import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  UnprocessableEntityException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { SupplierService } from './supplier.service';
import { FilterProductQueryDto } from './dto/filter-product-query.dto';
import { FetchtQueryDto } from './dto/fetch-query.dto';
import {
  UdpateSupplierDto,
  UdpateSuppliersDto,
} from './dto/update-supplier.dto';
import { Supplier } from './schemas/supplier.schema';
import { AuthorizationGuard } from '../commons/guards/authorization.guard';
import {
  PaginatedProductResponse,
  PaginatedSupplierResponse,
} from './dto/paginated-response.dto';
import { PaginatedSubCategoryResponse } from 'src/product-category/dto/paginated-response.dto';
import { UpdateManyResponse } from '../types';
import {
  UpdateCategoriesDto,
  UpdateCategoryDto,
  UpdateSubCategoriesDto,
  UpdateSubCategoryDto,
} from '../product-category/dto/update-product-category.dto';

@ApiTags('Supplier')
@UseGuards(AuthorizationGuard)
@ApiSecurity('uid')
@ApiBearerAuth()
@Controller('suppliers')
export class SupplierController {
  constructor(private readonly supplierService: SupplierService) {}

  @Get()
  @ApiOperation({ summary: 'Fetch suppliers' })
  @ApiOkResponse({
    description: 'Fetched suppliers data',
    type: PaginatedSupplierResponse,
  })
  async fetchSuppliers(@Query() query: FetchtQueryDto) {
    return await this.supplierService.findSuppliers(query);
  }

  @Get(':id')
  @ApiOkResponse({ description: 'supplier data', type: Supplier })
  async fetchSupplier(@Param('id') id: string) {
    return await this.supplierService.findOne(id);
  }

  @Patch('/:id')
  @ApiParam({ name: 'id', type: 'string', required: true })
  @ApiOperation({ summary: 'Update Supplier' })
  @ApiOkResponse({ description: 'Updated supplier data', type: Supplier })
  async updateSupplier(
    @Param('id') id: string,
    @Body() body: UdpateSupplierDto,
  ) {
    return await this.supplierService.updateSupplier(id, body);
  }

  @Patch()
  @ApiOperation({ summary: 'Update Supplier' })
  @ApiOkResponse({
    description: 'Updated supplier data',
    type: UpdateManyResponse,
  })
  async updateSupliers(@Body() body: UdpateSuppliersDto) {
    return await this.supplierService.updateSuppliers(body);
  }

  @Get('/:id/products')
  @ApiParam({ name: 'id', type: 'string', required: true })
  @ApiOperation({ summary: "Feth Supplier's Products" })
  @ApiOkResponse({
    description: 'Supplier producss',
    type: PaginatedProductResponse,
  })
  async fetchSupplierProducts(
    @Param('id') id: string,
    @Query() query: FilterProductQueryDto,
  ) {
    const supplier = await this.supplierService.findById(id);

    if (!supplier) {
      throw new UnprocessableEntityException("Supplier doesn't exist");
    }

    return await this.supplierService.getProductsBySupplier(id, query);
  }

  @Get('/:id/subcategories')
  @ApiParam({ name: 'id', type: 'string', required: true })
  @ApiOperation({ summary: "Feth Supplier's SubCategories" })
  @ApiOkResponse({
    description: 'Supplier Subcategories',
    type: PaginatedSubCategoryResponse,
  })
  async fetchSupplierSubCategories(
    @Param('id') id: string,
    @Query() query: FetchtQueryDto,
  ) {
    const supplier = await this.supplierService.findById(id);

    if (!supplier) {
      throw new UnprocessableEntityException("Supplier doesn't exist");
    }

    return await this.supplierService.getSubCategoriesBySupplier(id, query);
  }

  @Patch('/:id/subcategories/:subCategoryId')
  @ApiParam({ name: 'id', type: 'string', required: true })
  @ApiParam({ name: 'subCategoryId', type: 'string', required: true })
  async updateSupplierSubCategory(
    @Param('id') id: string,
    @Param('subCategoryId') subCategoryId: string,
    @Body() body: UpdateSubCategoryDto,
  ) {
    const supplier = await this.supplierService.findById(id);

    if (!supplier) {
      throw new UnprocessableEntityException("Supplier doesn't exist");
    }

    return await this.supplierService.updateSubCategory(
      subCategoryId,
      id,
      body,
    );
  }

  @Patch('/:id/categories/:categoryId')
  @ApiParam({ name: 'id', type: 'string', required: true })
  @ApiParam({ name: 'categoryId', type: 'string', required: true })
  async updateSupplierCategory(
    @Param('id') id: string,
    @Param('categoryId') categoryId: string,
    @Body() body: UpdateCategoryDto,
  ) {
    const supplier = await this.supplierService.findById(id);

    if (!supplier) {
      throw new UnprocessableEntityException("Supplier doesn't exist");
    }

    return await this.supplierService.updateCategory(categoryId, id, body);
  }

  @Patch('/:id/subcategory')
  @ApiParam({ name: 'id', type: 'string', required: true })
  @ApiOperation({ summary: 'Update SubCategories' })
  @ApiOkResponse({
    description: 'Updated subcategories data',
    type: UpdateManyResponse,
  })
  async updateSubCategories(
    @Param('id') id: string,
    @Body() body: UpdateSubCategoriesDto,
  ) {
    return await this.supplierService.updateSubCategories(id, body);
  }

  @Patch('/:id/category')
  @ApiParam({ name: 'id', type: 'string', required: true })
  @ApiOperation({ summary: 'Update Supplier Categories' })
  @ApiOkResponse({
    description: 'Updated supplier categories data',
    type: UpdateManyResponse,
  })
  async updateCategories(
    @Param('id') id: string,
    @Body() body: UpdateCategoriesDto,
  ) {
    return await this.supplierService.updateCategories(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete Supplier' })
  async deleteSupplier(@Param('id') id: string) {
    return await this.supplierService.delete(id);
  }
}
