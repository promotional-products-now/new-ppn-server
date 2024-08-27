import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiBearerAuth,
  ApiSecurity,
} from '@nestjs/swagger';
import { SuspendService } from './suspend.service';
import { CreateSuspendDto, UnSuspendDto } from './dto/create-suspend.dto';
import { Suspend } from './schemas/suspend.schema';
import { AuthorizationGuard } from '../commons/guards/authorization.guard';

@ApiTags('suspends')
@UseGuards(AuthorizationGuard)
@ApiSecurity('uid')
@ApiBearerAuth()
@Controller('suspends')
export class SuspendController {
  constructor(private readonly suspendService: SuspendService) {}

  @ApiOperation({ summary: 'Suspend a user' })
  @ApiResponse({
    status: 201,
    description: 'The user has been successfully suspended.',
    type: Suspend,
  })
  @ApiBody({ type: CreateSuspendDto })
  @Post()
  async create(@Body() createSuspendDto: CreateSuspendDto, @Request() req) {

    const { userId } = req.user;

    return await this.suspendService.suspend(userId, createSuspendDto);
  }

  @ApiOperation({ summary: 'UnSuspend a user' })
  @ApiBody({ type: UnSuspendDto })
  @Post('/resolve')
  async unsuspend(@Body() unSuspendDto: UnSuspendDto, @Request() req) {
    const { userId } = req.user;
    return await this.suspendService.unsuspend(unSuspendDto, userId);
  }

  @ApiOperation({ summary: 'Get all uspended users' })
  @ApiResponse({
    status: 200,
    description: 'Return all suspended users.',
    type: [Suspend],
  })
  @Get()
  async findAll() {
    return await this.suspendService.findAll();
  }

  @ApiOperation({ summary: 'Get suspensions by user ID' })
  @ApiResponse({
    status: 200,
    description: 'Return suspensions for the specified user.',
    type: Suspend,
  })
  @ApiParam({
    name: 'userId',
    required: true,
    description: 'The ID of the user to retrieve suspensions for',
  })
  @Get('user/:userId')
  async findByUserId(@Param('userId') userId: string) {
    return await this.suspendService.findByUserId(userId);
  }
}
