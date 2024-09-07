import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { HttpService } from '@nestjs/axios';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ProductService } from './product.service';
import {
  FilterProductByCategoryQueryDto,
  FilterProductQueryDto,
  FilterShowCaseQueryDto,
  TopSellingProductQuery,
} from './dto/filter-product-query.dto';
import { FetchtQueryDto } from './dto/fetch-query.dto';
import { PaginatedSupplierResponse } from './dto/paginated-response.dto';
import {
  FilterWithCreatedAt,
  MultiUpdateProductDto,
  UdpateSupplierDto,
  UpdateProductDto,
} from './dto/update-product.dto';
import { Product } from './schemas/product.schema';
import { Supplier } from './schemas/supplier.schema';
import { AuthorizationGuard } from '../commons/guards/authorization.guard';
import { ConfigService } from '@nestjs/config';
import { Environments } from 'src/commons/types/environments.types';

@Controller('products')
@ApiTags('product')
export class ProductController {
  constructor(
    private readonly productsService: ProductService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  @ApiQuery({ type: FilterProductQueryDto })
  async findAll(@Query() query) {
    return await this.productsService.findAll(query);
  }

  @Get('/updated')
  @ApiQuery({ type: FilterWithCreatedAt })
  async fetchUpdatedProducts(@Query() query) {
    return await this.productsService.fetchUpdatedProducts(query);
  }

  @Get('/new')
  @ApiQuery({ type: FilterWithCreatedAt })
  async fetchNewProducts(@Query() query) {
    return await this.productsService.fetchNewProducts(query);
  }

  @Get('/top-selling')
  @ApiQuery({ type: TopSellingProductQuery })
  async topSelling(@Query() query) {
    return await this.productsService.topSellingProducts(query);
  }

  @Get('/product-show-case')
  @ApiQuery({ type: FilterShowCaseQueryDto })
  async productShowCase(@Query() query) {
    return await this.productsService.productShowCase(query);
  }

  @Get('/latest')
  @ApiQuery({ type: FilterShowCaseQueryDto })
  async latestProducts(@Query() query) {
    return await this.productsService.latestProducts(query);
  }

  @Get('/hot-products')
  @ApiQuery({ type: FilterShowCaseQueryDto })
  async hotProducts(@Query() query) {
    return await this.productsService.hotProducts(query);
  }

  @Get('/check-stock-levels/:productId')
  @ApiParam({ name: 'productId', type: 'string', required: true })
  checkStockLevels(@Param('productId') productId: string): Observable<any> {
    const promoDataAuthToken =
      this.configService.getOrThrow<string>('PromoDataAuthToken');

    return this.httpService
      .post(
        `https://api.promodata.com.au/products/${productId}/check-stock-levels`,
        {},
        {
          headers: { 'x-auth-token': promoDataAuthToken },
        },
      )
      .pipe(map((response) => response.data));
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

  @UseGuards(AuthorizationGuard)
  @ApiSecurity('uid')
  @ApiBearerAuth()
  @Get('/suppliers')
  @ApiOperation({ summary: 'Fetch suppliers' })
  @ApiOkResponse({
    description: 'Fetched suppliers data',
    type: PaginatedSupplierResponse,
  })
  async findSuppliers(@Query() query: FetchtQueryDto) {
    return await this.productsService.findSuppliers(query);
  }

  @Get('/product-code/:productCode')
  @ApiParam({ name: 'productCode', type: 'string', required: true })
  async findByProductCode(@Param('productCode') productCode: string) {
    return await this.productsService.findByProductCode(productCode);
  }

  @Get('/:id')
  @ApiParam({ name: 'id', type: 'string', required: true })
  async findById(@Param('id') id: string) {
    return await this.productsService.findById(id);
  }

  @UseGuards(AuthorizationGuard)
  @ApiSecurity('uid')
  @ApiBearerAuth()
  @Patch('/update-many')
  @ApiBody({ type: MultiUpdateProductDto })
  @ApiOperation({ summary: 'Update Product' })
  @ApiOkResponse({ description: 'Updated product data', type: Product })
  async updateManyProduct(@Body() body) {
    return await this.productsService.updateManyProduct(body.ids, body.payload);
  }

  @UseGuards(AuthorizationGuard)
  @ApiSecurity('uid')
  @ApiBearerAuth()
  @Patch('/:id')
  @ApiParam({ name: 'id', type: 'string', required: true })
  @ApiOperation({ summary: 'Update Product' })
  @ApiOkResponse({ description: 'Updated product data', type: Product })
  async updateProduct(@Param('id') id: string, @Body() body: UpdateProductDto) {
    return await this.productsService.updateProduct(id, body);
  }

  @UseGuards(AuthorizationGuard)
  @ApiSecurity('uid')
  @ApiBearerAuth()
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
