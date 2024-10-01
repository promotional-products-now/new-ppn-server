import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { AdvertService } from './advert.service';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('adverts')
@Controller('adverts')
export class AdvertController {
  constructor(private readonly advertService: AdvertService) {}

  @ApiOperation({ summary: 'Create a new advert' })
  @ApiResponse({
    status: 201,
    description: 'The advert has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @Post()
  async create(@Body() createAdvertDto: any) {
    return this.advertService.create(createAdvertDto);
  }

  @ApiOperation({ summary: 'Get all adverts' })
  @ApiResponse({ status: 200, description: 'Returns a list of all adverts.' })
  @Get()
  async findAll() {
    return this.advertService.findAll();
  }

  @ApiOperation({ summary: 'Get an advert by ID' })
  @ApiParam({ name: 'id', description: 'ID of the advert', type: String })
  @ApiResponse({
    status: 200,
    description: 'Returns the advert with the specified ID.',
  })
  @ApiResponse({ status: 404, description: 'Advert not found.' })
  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.advertService.findById(id);
  }

  @ApiOperation({ summary: 'Update an advert by ID' })
  @ApiParam({ name: 'id', description: 'ID of the advert', type: String })
  @ApiResponse({
    status: 200,
    description: 'The advert has been successfully updated.',
  })
  @ApiResponse({ status: 404, description: 'Advert not found.' })
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateAdvertDto: any) {
    return this.advertService.update(id, updateAdvertDto);
  }

  @ApiOperation({ summary: 'Delete an advert by ID' })
  @ApiParam({ name: 'id', description: 'ID of the advert', type: String })
  @ApiResponse({
    status: 200,
    description: 'The advert has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Advert not found.' })
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.advertService.delete(id);
  }
}
