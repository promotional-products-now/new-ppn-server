import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { UserActivityService } from './user_activity.service';
import {
  CreateUserActivityDto,
  CreateUserActivityResDto,
} from './dto/create-user_activity.dto';
import { UpdateUserActivityDto } from './dto/update-user_activity.dto';
import { AuthorizationGuard } from '../commons/guards/authorization.guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiTags,
  ApiParam,
} from '@nestjs/swagger';
import {
  FilterWithCreatedAt,
  FindUserActivity,
  UserActivitySearchDto,
} from './dto/find_user_activity.dto';
import { PaginationDto } from '../commons/dtos/pagination.dto';

@ApiTags('users-activity')
@UseGuards(AuthorizationGuard)
@ApiSecurity('uid')
@ApiBearerAuth()
@Controller('user-activity')
export class UserActivityController {
  constructor(private readonly userActivityService: UserActivityService) {}

  @Post('/')
  @ApiOperation({ summary: 'Add activity performed by a user on the platform' })
  @ApiBody({ type: CreateUserActivityDto, description: 'Create user data' })
  @ApiResponse({
    status: 201,
    description: 'The user activity has been successfully created.',
    type: CreateUserActivityResDto,
  })
  create(@Body() createUserActivityDto: CreateUserActivityDto, @Request() req) {
    const { userId } = req.user;
    return this.userActivityService.create(userId, createUserActivityDto);
  }

  @Get('/filter')
  @ApiOperation({ summary: 'Filtered all users' })
  @ApiResponse({
    status: 200,
    description: 'Successfully filtered all users.',
    type: FindUserActivity,
  })
  filterActivityWithCreatedAt(@Query() filterQuery: FilterWithCreatedAt) {
    return this.userActivityService.filterActivityWithCreatedAt(filterQuery);
  }

  @ApiOperation({ summary: 'Fetched all admins' })
  @ApiResponse({
    status: 200,
    description: 'Successfully fetched all admins.',
    type: FindUserActivity,
  })
  @Get('/admin')
  fetchAdminActivities(@Query() paginationData: PaginationDto) {
    return this.userActivityService.getAdminActivity(paginationData);
  }

  @Get('/search')
  @ApiOperation({ summary: 'Search user activities' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved a user activities by search.',
    type: FindUserActivity,
  })
  searchUserActivity(@Query() searchQuery: UserActivitySearchDto) {
    return this.userActivityService.searchAndFilterActivityLogs(searchQuery);
  }

  @Get('/:id')
  @ApiOperation({ summary: 'Retrieved all user activities' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved a user activities.',
    type: FindUserActivity,
  })
  @ApiParam({ name: 'id', description: 'User ID' })
  getUserActivity(
    @Query() filterQuery: PaginationDto,
    @Param('id') id: string,
  ) {
    return this.userActivityService.getOneUserActivity(id, filterQuery);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userActivityService.remove(+id);
  }
}
