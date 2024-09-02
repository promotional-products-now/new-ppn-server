import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { OrderService } from './order.service';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { FindOrderDto } from './dto/find-order';
import { Order } from './schemas/order.schema';
import { UpdateOrderDto } from './dto/update-order';
import { AuthorizationGuard } from 'src/commons/guards/authorization.guard';

@ApiTags('orders')
@Controller('orders')
@UseGuards(AuthorizationGuard)
@ApiSecurity('uid')
@ApiBearerAuth()
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  @ApiOperation({ summary: 'finds all orders' })
  async findAll(@Query() query: FindOrderDto) {
    return await this.orderService.findAll(query);
  }

  @Get(':id')
  async getOrderById(@Param('id') id: string) {
    return await this.orderService.findOne(id);
  }

  @Delete(':id')
  async deleteOrder(@Param('id') id: string) {
    return await this.orderService.remove(id);
  }

  @Patch('/:id')
  @ApiParam({ name: 'id', type: 'string', required: true })
  @ApiOperation({ summary: 'Updates an order' })
  @ApiOkResponse({ description: 'Updated order data', type: Order })
  async updateOrder(@Param('id') id: string, @Body() body: UpdateOrderDto) {
    return await this.orderService.update({ ...body, id: id });
  }
}
