import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReportService } from './report.service';
import { ReportController } from './report.controller';
import { Report, ReportSchema } from './schemas/report.schema';
import { JWTModule } from '../commons/services/JWTService/JWTService.module';
import { UserActivityModule } from '../user_activity/user_activity.module';

@Module({
  imports: [
    JWTModule,
    UserActivityModule,
    MongooseModule.forFeature([{ name: Report.name, schema: ReportSchema }]),
  ],
  controllers: [ReportController],
  providers: [ReportService],
})
export class ReportModule {}
