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
import { AuthorizationGuard } from 'src/commons/guards/authorization.guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import {
  FilterWithCreatedAt,
  FindUserActivity,
} from './dto/find_user_activity.dto';
import { PaginationDto } from 'src/commons/dtos/pagination.dto';

@ApiTags('users-activity')
@Controller('user-activity')
// @UseGuards(AuthorizationGuard)
// @ApiSecurity('uid')
// @ApiBearerAuth()
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
  findOne(@Query() paginationData: PaginationDto) {
    return this.userActivityService.getAdminActivity(paginationData);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserActivityDto: UpdateUserActivityDto,
  ) {
    return this.userActivityService.update(+id, updateUserActivityDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userActivityService.remove(+id);
  }
}
