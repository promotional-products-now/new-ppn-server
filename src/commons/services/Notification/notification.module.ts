import { Module } from '@nestjs/common';
import { EmailService } from './Email/email.service';

@Module({
  imports: [],
  controllers: [],
  providers: [EmailService],
  exports: [EmailService],
})
export class NotificationModule {}
