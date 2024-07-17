import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as sgMail from '@sendgrid/mail';
import { ConfigService } from '@nestjs/config';
import { sendGrid } from 'src/configs';

@Injectable()
export class EmailService {
  constructor(private configService: ConfigService) {
    const sendgridApiKey = this.configService.get<sendGrid>('sendGrid');
    sgMail.setApiKey(sendgridApiKey.apiKey);
  }
  async sendEmailToUsers(
    recipients: string[],
    subject: string,
    message: string,
  ): Promise<void> {
    const sendGrid = this.configService.get<sendGrid>('sendGrid');

    const messages = recipients.map((recipient) => ({
      to: recipient,
      from: sendGrid.sender_address,
      subject,
      html: `<p>${message}</p>`,
    }));

    try {
      await sgMail.send(messages, true);
    } catch (error) {
      throw new InternalServerErrorException('Error sending email:', error);
    }
  }
}
