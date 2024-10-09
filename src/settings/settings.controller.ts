import {
  Body,
  Controller,
  Get,
  Patch,
  ParseFilePipe,
  UploadedFile,
  UseInterceptors,
  Query,
  Post,
  UseGuards,
  Delete,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { SettingsService } from './settings.service';
import {
  ApiOkResponse,
  ApiTags,
  ApiConsumes,
  ApiBody,
  ApiOperation,
  ApiCreatedResponse,
  ApiBearerAuth,
  ApiSecurity,
  ApiResponse,
} from '@nestjs/swagger';
import { UpdateProfitSettingDto } from './dto/update-profit-setting.dto';
import { UpdateBannerSettingDto } from './dto/update-banner-setting.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { ProfitSetting } from './schemas/profit-setting.schema';
import { BannerSetting } from './schemas/banner-setting.schema';
import { FetchFreightQueryDto } from './dto/fetch-freight-query.dto';
import { PaginatedFreightSettingsResponse } from './dto/paginated-freight-response';
import { CreateFreightDto } from './dto/create-freight.dto';
import { FreightIdsDto, UpdateFreightDto } from './dto/update-freight.dto';
import { Freight } from './schemas/freight.schema';
import { FetchSupplierstQueryDto } from './dto/fetch-suppliers.dto';
import { AuthorizationGuard } from '../commons/guards/authorization.guard';
import { PurchaseSetting } from './schemas/purchase-setting.schema';
import { UpdatePurchaseSettingDto } from './dto/update-purchase-setting.dto';
import { DestinationType, FreightType } from './settings.interface';

@Controller('settings')
@ApiTags('settings')
export class SettingsController {
  constructor(
    private readonly settingsService: SettingsService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @UseGuards(AuthorizationGuard)
  @ApiSecurity('uid')
  @ApiBearerAuth()
  @Get('/profits')
  @ApiOperation({ summary: 'Fetch profit setting' })
  @ApiOkResponse({
    description: 'Profit setting fetched successfully.',
    type: ProfitSetting,
  })
  getProfitSetting() {
    return this.settingsService.getProfitSetting();
  }

  @UseGuards(AuthorizationGuard)
  @ApiSecurity('uid')
  @ApiBearerAuth()
  @Patch('/profits')
  @ApiOperation({ summary: 'Update profit setting' })
  @ApiOkResponse({
    description: 'Profit setting updated successfully.',
    type: ProfitSetting,
  })
  updateProfitSetting(@Body() body: UpdateProfitSettingDto) {
    return this.settingsService.updateProfitSetting(body);
  }

  @Get('/banner')
  @ApiOperation({ summary: 'Fetch banner setting' })
  @ApiOkResponse({
    description: 'Banner setting fetched successfully.',
    type: BannerSetting,
  })
  getBannerSetting() {
    return this.settingsService.getBannerSetting();
  }

  @UseGuards(AuthorizationGuard)
  @ApiSecurity('uid')
  @ApiBearerAuth()
  @Patch('/banner')
  @ApiOperation({ summary: 'Udate banner setting' })
  @ApiOkResponse({
    description: 'Bannersetting updated successfully.',
    type: UpdateBannerSettingDto,
  })
  async updateBannerSetting(@Body() body: UpdateBannerSettingDto) {
    return this.settingsService.updateBannerSetting(body);
  }

  @UseGuards(AuthorizationGuard)
  @ApiSecurity('uid')
  @ApiBearerAuth()
  @Patch('/banner/image')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseGuards(AuthorizationGuard)
  @ApiSecurity('uid')
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload Pop-up modal image' })
  @ApiOkResponse({
    description: 'Pop-up modal image uploaded successfully.',
    type: BannerSetting,
  })
  async uploadBannerImage(
    @UploadedFile(new ParseFilePipe({ fileIsRequired: false }))
    file: Express.Multer.File,
  ) {
    const response = await this.cloudinaryService.uploadImage(file);

    return this.settingsService.updateBannerSetting({
      'popupModal.image': response.secure_url,
    });
  }

  @UseGuards(AuthorizationGuard)
  @ApiSecurity('uid')
  @ApiBearerAuth()
  @Get('/freight')
  @ApiOperation({ summary: 'Fetch vendor freight settings' })
  @ApiOkResponse({
    description: 'Freight settings fetched successfully',
    type: PaginatedFreightSettingsResponse,
  })
  async fetchFreightSetting(@Query() query: FetchFreightQueryDto) {
    return this.settingsService.fetchFreights(query);
  }

  @UseGuards(AuthorizationGuard)
  @ApiSecurity('uid')
  @ApiBearerAuth()
  @Post('/freight')
  @ApiOperation({ summary: 'Create Vendor Freight Setting' })
  @ApiCreatedResponse({ description: 'Created freight docs', type: Freight })
  async createFreight(@Body() body: CreateFreightDto) {
    const supplierFreight = await this.settingsService.fetchFreights({
      supplierId: body.supplier,
      page: 1,
      limit: 20,
    });

    // Check if supplier already has a free unconditional freight type
    const hasUnconditional = supplierFreight.docs.some(
      (freight) => freight.destinationType === DestinationType.UN_CONDITIONAL,
    );

    // If the supplier already has a free unconditional freight, return an error
    if (
      hasUnconditional &&
      body.destinationType === DestinationType.UN_CONDITIONAL
    ) {
      throw new BadRequestException(
        `Supplier already has an unconditional freight option`,
      );
    }

    // Proceed to create the freight
    return this.settingsService.createFreight(body);
  }
  @UseGuards(AuthorizationGuard)
  @ApiSecurity('uid')
  @ApiBearerAuth()
  @Patch('/freight')
  @ApiOperation({ summary: 'Update Vendor Freight Setting' })
  @ApiOkResponse({ description: 'Updated freight docs ', type: [Freight] })
  async updateFreight(@Body() body: UpdateFreightDto) {
    return this.settingsService.updateFreights(body);
  }

  @Delete('/freight')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete multiple freight records by IDs' })
  @ApiResponse({
    status: 204,
    description: 'The freight records have been deleted successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input, IDs must be valid.',
  })
  @ApiBody({
    type: FreightIdsDto,
    description: 'Array of freight IDs to delete',
  })
  async deleteFreight(@Body() deleteFreightDto: FreightIdsDto) {
    await this.settingsService.deleteFreight(deleteFreightDto.ids);
  }

  @UseGuards(AuthorizationGuard)
  @ApiSecurity('uid')
  @ApiBearerAuth()
  @Get('/suppliers')
  @ApiOperation({ summary: 'Fetch Suppliers' })
  @ApiOkResponse({ description: 'Suppliers fetched successfully' })
  async getSuppliers(@Query() query: FetchSupplierstQueryDto) {
    return this.settingsService.getSuppliers(query);
  }

  @UseGuards(AuthorizationGuard)
  @ApiSecurity('uid')
  @ApiBearerAuth()
  @Get('/purchase-setting')
  @ApiOkResponse({
    description: 'Purchase Setting Fetched successfully',
    type: PurchaseSetting,
  })
  @ApiOperation({ summary: 'Fetch Purchase Setting' })
  async fetchPurchaseSetting() {
    return this.settingsService.getPurchaseSetting();
  }

  @UseGuards(AuthorizationGuard)
  @ApiSecurity('uid')
  @ApiBearerAuth()
  @Patch('/purchase-setting')
  @ApiOkResponse({
    description: 'Purchase Setting Update successfully',
    type: PurchaseSetting,
  })
  @ApiOperation({ summary: 'Update Purchase Setting' })
  async updatePurchaseSetting(@Body() body: UpdatePurchaseSettingDto) {
    return this.settingsService.updatePurchaseSetting(body);
  }
}
