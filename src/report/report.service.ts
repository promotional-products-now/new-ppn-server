// report.service.ts
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Report, ReportDocument } from './schemas/report.schema';
import { CreateReportDto } from './dto/create-report.dto';

@Injectable()
export class ReportService {
  constructor(
    @InjectModel(Report.name) private reportModel: Model<ReportDocument>,
  ) {}

  async create(createReportDto: CreateReportDto): Promise<{ message: string }> {
    try {
      await this.reportModel.create(createReportDto);
      return { message: 'Report has been successfully submitted' };
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  async findAll(): Promise<Report[]> {
    return await this.reportModel.find();
  }

  async findByUser(userId: string): Promise<Report[]> {
    return await this.reportModel.find({ reportedUser: userId });
  }
}
