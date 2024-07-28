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

@ApiTags('analytics')
@UseGuards(AuthorizationGuard)
@ApiSecurity('uid')
@ApiBearerAuth()
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
