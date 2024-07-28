import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { EmailService } from './email.service';
import { BulkEmailRequestDto } from './dto/create-email.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { AuthorizationGuard } from '../commons/guards/authorization.guard';

@ApiTags('email')
@UseGuards(AuthorizationGuard)
@ApiSecurity('uid')
@ApiBearerAuth()
@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('/bulk-email')
  @ApiOperation({ summary: 'Sent email successfully' })
  @ApiResponse({
    status: 201,
    description: 'Successfully sent out emails to users.',
  })
  async sendMailToUsers(@Body() mailData: BulkEmailRequestDto) {
    await this.emailService.sendEmailToUsers(
      mailData.recipients,
      mailData.subject,
      mailData.content,
      mailData.title,
    );

    return 'Email sent successfully';
  }
}
