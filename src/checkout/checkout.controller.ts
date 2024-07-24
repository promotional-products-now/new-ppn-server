import {
    BadRequestException,
    Body,
    Controller,
    Logger,
    LoggerService,
    Post,
} from '@nestjs/common';
import {
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiTags,
} from '@nestjs/swagger';
import { CheckoutService } from './checkout.service';
import { CheckoutInput } from './dto/checkout.dto';

@ApiTags('checkout')
@Controller('checkout')
export class CheckoutController {
    private logger = new Logger(CheckoutController.name);

    constructor(readonly checkoutService: CheckoutService) { }

    @Post('/')
    @ApiOperation({ summary: 'Creates a checkout session' })
    async checkoutCart(@Body() body: CheckoutInput) {
        try {
            this.logger.verbose(`Checkout request: ${JSON.stringify(body)}`);
            return await this.checkoutService.checkout(body);
        } catch (error) {
            this.logger.error(`Checkout error: ${error.message}`);
            throw new BadRequestException(error.message);
        }
    }
}
