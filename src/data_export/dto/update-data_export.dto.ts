import { PartialType } from '@nestjs/swagger';
import { CreateDataExportDto } from './create-data_export.dto';

export class UpdateDataExportDto extends PartialType(CreateDataExportDto) {}
