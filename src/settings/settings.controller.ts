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
import { UpdateFreightDto } from './dto/update-freight.dto';
import { Freight } from './schemas/freight.schema';
import { FetchSupplierstQueryDto } from './dto/fetch-suppliers.dto';
import { AuthorizationGuard } from '../commons/guards/authorization.guard';
import { PurchaseSetting } from './schemas/purchase-setting.schema';
import { UpdatePurchaseSettingDto } from './dto/update-purchase-setting.dto';

@Controller('settings')
// @UseGuards(AuthorizationGuard)
// @ApiSecurity('uid')
// @ApiBearerAuth()
@ApiTags('settings')
export class SettingsController {
  constructor(
    private readonly settingsService: SettingsService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Get('/profits')
  @ApiOperation({ summary: 'Fetch profit setting' })
  @ApiOkResponse({
    description: 'Profit setting fetched successfully.',
    type: ProfitSetting,
  })
  getProfitSetting() {
    return this.settingsService.getProfitSetting();
  }

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

  @Patch('/banner')
  @ApiOperation({ summary: 'Udate banner setting' })
  @ApiOkResponse({
    description: 'Bannersetting updated successfully.',
    type: UpdateBannerSettingDto,
  })
  async updateBannerSetting(@Body() body: UpdateBannerSettingDto) {
    return this.settingsService.updateBannerSetting(body);
  }

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

  @Get('/freight')
  @ApiOperation({ summary: 'Fetch vendor freight settings' })
  @ApiOkResponse({
    description: 'Freight settings fetched successfully',
    type: PaginatedFreightSettingsResponse,
  })
  async fetchFreightSetting(@Query() query: FetchFreightQueryDto) {
    return this.settingsService.fetchFreights(query);
  }

  @Post('/freight')
  @ApiOperation({ summary: 'Create Vendor Freight Setting' })
  @ApiCreatedResponse({ description: 'Created freight docs', type: Freight })
  async createFreight(@Body() body: CreateFreightDto) {
    return this.settingsService.createFreight(body);
  }

  @Patch('/freight')
  @ApiOperation({ summary: 'Update Vendor Freight Setting' })
  @ApiOkResponse({ description: 'Updated freight docs ', type: [Freight] })
  async updateFreight(@Body() body: UpdateFreightDto) {
    return this.settingsService.updateFreights(body);
  }

  @Get('/suppliers')
  @ApiOperation({ summary: 'Fetch Suppliers' })
  @ApiOkResponse({ description: 'Suppliers fetched successfully' })
  async getSuppliers(@Query() query: FetchSupplierstQueryDto) {
    return this.settingsService.getSuppliers(query);
  }

  @Get('/purchase-setting')
  @ApiOkResponse({
    description: 'Purchase Setting Fetched successfully',
    type: PurchaseSetting,
  })
  @ApiOperation({ summary: 'Fetch Purchase Setting' })
  async fetchPurchaseSetting() {
    return this.settingsService.getPurchaseSetting();
  }

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
