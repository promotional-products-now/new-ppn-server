import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CreateReportDto } from './dto/create-report.dto';
import { ReportService } from './report.service';
import { Report } from './schemas/report.schema';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiBearerAuth,
  ApiSecurity,
} from '@nestjs/swagger';
import { AuthorizationGuard } from '../commons/guards/authorization.guard';

@ApiTags('reports')
@UseGuards(AuthorizationGuard)
@ApiSecurity('uid')
@ApiBearerAuth()
@Controller('reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Post()
  @ApiOperation({ summary: 'Report a user' })
  @ApiResponse({
    status: 201,
    description: 'The report has been successfully submitted.',
    type: Report,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiBody({ type: CreateReportDto })
  async create(
    @Body() createReportDto: CreateReportDto,
    @Request() req,
  ): Promise<{ message: string }> {
    const { userId } = req.user;

    return await this.reportService.create({
      ...createReportDto,
      reportedBy: userId,
    });
  }

  @Get()
  @ApiOperation({ summary: 'Get all reports' })
  @ApiResponse({
    status: 200,
    description: 'List of all reports',
    type: [Report],
  })
  async findAll(): Promise<Report[]> {
    return this.reportService.findAll();
  }

  @Get(':userId')
  @ApiOperation({ summary: 'Get reports for a specific user' })
  @ApiResponse({
    status: 200,
    description: 'List of reports for the specified user',
    type: [Report],
  })
  @ApiParam({
    name: 'userId',
    required: true,
    description: 'ID of the user',
    type: String,
  })
  async findByUser(@Param('userId') userId: string): Promise<Report[]> {
    return this.reportService.findByUser(userId);
  }
}
