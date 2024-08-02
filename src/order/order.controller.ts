import { Controller, Delete, Get, Param, Query } from '@nestjs/common';
import { OrderService } from './order.service';
import { ApiTags } from '@nestjs/swagger';
import { FindOrderDto } from './dto/find-order';

@Controller('orders')
@ApiTags('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
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
}
