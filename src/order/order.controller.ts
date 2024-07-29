import { Controller, Get, Query } from '@nestjs/common';
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
}
