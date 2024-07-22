import { Controller, Get, Post, Body } from '@nestjs/common';
import { EmailService } from './email.service';
import { BulkEmailRequestDto } from './dto/create-email.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('email')
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
