import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as sgMail from '@sendgrid/mail';
import * as pug from 'pug';
import * as path from 'path';
import { ConfigService } from '@nestjs/config';
import { sendGrid } from 'src/configs';

@Injectable()
export class EmailService {
  constructor(private configService: ConfigService) {
    const sendgridApiKey = this.configService.get<sendGrid>('sendGrid');
    sgMail.setApiKey(sendgridApiKey.apiKey);
  }
  createHtmlContent(header: string, content: string): string {
    const templatePath = path.join(__dirname, 'template', 'email_template.pug');
    return pug.renderFile(templatePath, { content, header });
  }

  async sendEmailToUsers(
    recipients: string[],
    subject: string,
    content: string,
    title: string,
  ): Promise<void> {
    const sendGrid = this.configService.get<sendGrid>('sendGrid');

    const messages = recipients.map((recipient) => ({
      to: recipient,
      from: sendGrid.sender_address,
      subject,
      html: this.createHtmlContent(title, content),
    }));

    try {
      await sgMail.send(messages, true);
    } catch (error) {
      throw new InternalServerErrorException('Error sending email:', error);
    }
  }
}
