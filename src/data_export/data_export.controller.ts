import { Controller, Get, Res } from '@nestjs/common';
import { UserDataExportService } from './user_data_export.service';
import { Response } from 'express';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('data-export')
@Controller('data-export')
export class DataExportController {
  constructor(private readonly userDataExportService: UserDataExportService) {}

  @Get('/user-data')
  @ApiOperation({ summary: 'Export all users data' })
  exportUserData(@Res() res: Response) {
    console.log('hi');
    return this.userDataExportService.exportUserData(res);
  }
}
