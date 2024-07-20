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

@ApiTags('users-activity')
@Controller('user-activity')
@UseGuards(AuthorizationGuard)
@ApiSecurity('uid')
@ApiBearerAuth()
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

  @Get()
  findAll() {
    return this.userActivityService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userActivityService.findOne(+id);
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
