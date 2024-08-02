import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { UserAnalyticsService } from './user_analytics.service';
import { AnalyticsDto } from './dto/analytics.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { UserAnalytics } from './dto/user-analytics.dto';
import { AuthorizationGuard } from '../commons/guards/authorization.guard';
import { OrderAnalyticsService } from './order_analytics.service';

@ApiTags('analytics')
@UseGuards(AuthorizationGuard)
@ApiSecurity('uid')
@ApiBearerAuth()
@Controller('analytics')
export class AnalyticsController {
  constructor(
    private readonly userAnalyticsService: UserAnalyticsService,
    private readonly orderAnalyticsService: OrderAnalyticsService,
  ) {}

  @Get('/user-analytics')
  @ApiOperation({ summary: 'Retrieve users analytics successfully' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved users analytics.',
    type: UserAnalytics,
  })
  getUserAnalytics(@Query() userAnalyticsDto: AnalyticsDto) {
    return this.userAnalyticsService.userAnalytics(userAnalyticsDto);
  }

  @Get('/order-analytics')
  @ApiOperation({ summary: 'Retrieve orders analytics successfully' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved orders analytics.',
    type: UserAnalytics,
  })
  getOrderAnalytics(@Query() orderAnalyticsDto: AnalyticsDto) {
    return this.orderAnalyticsService.getOrderAnalytics(orderAnalyticsDto);
  }
}
