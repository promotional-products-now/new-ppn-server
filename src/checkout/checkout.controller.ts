import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Query,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CheckoutService } from './checkout.service';
import { CheckoutInput } from './dto/checkout.dto';
import { AuthorizationGuard } from 'src/commons/guards/authorization.guard';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';

@ApiTags('checkout')
@Controller('checkout')
export class CheckoutController {
  private logger = new Logger(CheckoutController.name);

  constructor(
    readonly checkoutService: CheckoutService,
    private configService: ConfigService,
  ) { }

  @Get('/redirector')
  @ApiOperation({ summary: 'redirects the user after a successful or failed checkout' })
  async callback(
    @Query('status') status: string,
    @Query('orderId') orderId: string,
    @Res() res: Response,
  ) {
    try {
      if (!status || !orderId) {
        throw new BadRequestException('Missing status or orderId');
      }

      const domain = this.configService.getOrThrow('domain');
      const frontendUrl = `https://${domain}/dashboard?orderId=${orderId}&status=${status}`;

      this.logger.verbose(`Callback request: ${JSON.stringify({ status })}`);
      await this.checkoutService.handleRedirectCallback({ status, orderId });

      return res.redirect(frontendUrl);
    } catch (error) {
      this.logger.error(`callback error: ${error.message}`);
      throw new BadRequestException(error.message);
    }
  }

  @Post('/')
  @ApiOperation({ summary: 'Creates a checkout session' })
  @ApiCreatedResponse({
    description: 'Creates a checkout session',
    type: CheckoutInput,
  })
  @UseGuards(AuthorizationGuard)
  async checkoutCart(@Body() body: CheckoutInput, @Request() req) {
    try {
      this.logger.verbose(`Checkout request: ${JSON.stringify(body)}`);
      const { url } = await this.checkoutService.processOrder(req.user, body);
      return {
        success: true,
        url: url,
      };
    } catch (error) {
      this.logger.error(`Checkout error: ${error.message}`);
      throw new BadRequestException(error.message);
    }
  }
}
