// report.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from '../../user/schemas/user.schema';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ReportType } from './report.enum';

@Schema({ versionKey: false })
export class Report {
  @ApiPropertyOptional({
    description: 'ID of the user being reported',
  })
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  reportedUser: Types.ObjectId;

  @ApiPropertyOptional({
    description: 'ID of the user who reported',
  })
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  reportedBy: Types.ObjectId;

  @ApiPropertyOptional({
    description: 'Type of report',
    enum: ReportType,
    default: ReportType.Others,
  })
  @Prop({ required: true, enum: ReportType, default: ReportType.Others })
  reportType: string;

  @ApiPropertyOptional({
    description: 'Reason for the report',
    required: false,
  })
  @Prop({ required: false })
  reason: string;

  @ApiPropertyOptional({
    description: 'Detailed description of the report',
    required: false,
  })
  @Prop({ required: false })
  detail: string;

  @ApiPropertyOptional({
    description: 'Additional comments',
    required: false,
  })
  @Prop({ required: false })
  comment: string;

  @ApiPropertyOptional({
    description: 'Date when the report was created',
  })
  @Prop({ default: Date.now })
  createdAt: Date;
}

export type ReportDocument = HydratedDocument<Report>;

export const ReportSchema = SchemaFactory.createForClass(Report);
