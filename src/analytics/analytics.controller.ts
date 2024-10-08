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
import { AnalyticsService } from './analytics.service';

@ApiTags('analytics')
@UseGuards(AuthorizationGuard)
@ApiSecurity('uid')
@ApiBearerAuth()
@Controller('analytics')
export class AnalyticsController {
  constructor(
    private readonly userAnalyticsService: UserAnalyticsService,
    private readonly orderAnalyticsService: OrderAnalyticsService,
    private readonly analyticsService: AnalyticsService,
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

  @Get('/order-analytics-line')
  @ApiOperation({ summary: 'Retrieve orders analytics successfully' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved orders analytics.',
    type: UserAnalytics,
  })
  getOrderAnalyticsLineItems(@Query() orderAnalyticsDto: AnalyticsDto) {
    return this.orderAnalyticsService.getOrderAnalyticsLineChart(
      orderAnalyticsDto,
    );
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

  //total products, total orders, total earnings
  @Get('/dashboard-count')
  @ApiOperation({
    summary: 'Retrieve total products, total orders, total earnings',
  })
  async getDashboardTotal() {
    return await this.analyticsService.getDashboardTotal();
  }
}
