import { Controller, Get, Query } from '@nestjs/common';
import { UserAnalyticsService } from './user_analytics.service';
import { AnalyticsDto } from './dto/analytics.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserAnalytics } from './dto/user-analytics.dto';

@ApiTags('analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly userAnalyticsService: UserAnalyticsService) {}

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
}
