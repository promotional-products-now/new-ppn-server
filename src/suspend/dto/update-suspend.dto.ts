import { PartialType } from '@nestjs/swagger';
import { CreateSuspendDto } from './create-suspend.dto';

export class UpdateSuspendDto extends PartialType(CreateSuspendDto) {}
