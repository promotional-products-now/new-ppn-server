import { PartialType } from '@nestjs/swagger';
import { SignupAuthDto } from './auth.dto';

export class UpdateAuthDto extends PartialType(SignupAuthDto) {}
