import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { Order } from './schemas/order.schema';
import { AddCartItemDto, UpdateCartItemDto } from './dto/cart';
import { CartService } from './cart.service';
import { AuthorizationGuard } from 'src/commons/guards/authorization.guard';

@ApiTags('cart')
@UseGuards(AuthorizationGuard)
@ApiSecurity('uid')
@ApiBearerAuth()
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get('find-all')
  async findAll(@Request() req) {
    return this.cartService.findAll({
      isCheckedOut: false,
      userId: req.user._id,
    });
  }

  @Get(':id')
  async findByUserId(@Param('id') id: string) {
    return this.cartService.findAll({
      isCheckedOut: false,
      userId: id,
    });
  }

  @Delete(':id')
  @ApiParam({ name: 'id', type: 'string', required: true })
  @ApiOperation({ summary: 'deletes a cart item' })
  @ApiOkResponse({ description: 'deletes a cart item', type: Boolean })
  async deleteCartItem(@Param('id') id: string) {
    return await this.cartService.remove(id);
  }

  @Post('/add-to-cart')
  @ApiOperation({ summary: 'adds a product to cart' })
  // @ApiOkResponse({ description: 'adds a product to cart', type: Boolean })
  async addToCart(@Body() body: AddCartItemDto) {
    return this.cartService.addToCart(body);
  }

  @Patch('/:id')
  @ApiParam({ name: 'id', type: 'string', required: true })
  @ApiOperation({ summary: 'Updates a cart item' })
  @ApiOkResponse({ description: 'Updates a cart item', type: Order })
  async updateOrder(@Param('id') id: string, @Body() body: UpdateCartItemDto) {
    return await this.cartService.update({ ...body, id: id });
  }
}
