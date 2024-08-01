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
import { UdpateSupplierDto } from './dto/update-supplier.dto';
import { Supplier } from './schemas/supplier.schema';
import { AuthorizationGuard } from '../commons/guards/authorization.guard';
import {
  PaginatedProductResponse,
  PaginatedSupplierResponse,
} from './dto/paginated-response.dto';

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

  @Get('/:id/products')
  @ApiParam({ name: 'id', type: 'string', required: true })
  @ApiOperation({ summary: "Feth SUpplier's Products" })
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

  @Delete(':id')
  @ApiOperation({ summary: 'Delete Supplier' })
  async deleteSupplier(@Param('id') id: string) {
    return await this.supplierService.delete(id);
  }
}
