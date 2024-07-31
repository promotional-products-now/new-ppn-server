import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';
import { ConfigModule } from '@nestjs/config';
import { JWTModule } from '../commons/services/JWTService/JWTService.module';
import { UserModule } from '../user/user.module';
import { AuthorizationGuard } from '../commons/guards/authorization.guard';

@Module({
  imports: [JWTModule, ConfigModule, UserModule],
  controllers: [EmailController],
  providers: [EmailService, AuthorizationGuard],
  exports: [EmailService],
})
export class EmailModule {}
