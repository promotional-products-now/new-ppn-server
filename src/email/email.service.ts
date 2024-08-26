import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as sgMail from '@sendgrid/mail';
import * as pug from 'pug';
import * as path from 'path';
import { ConfigService } from '@nestjs/config';
import { sendGrid } from '../configs';

@Injectable()
export class EmailService {
  constructor(private configService: ConfigService) {
    const sendgridApiKey = this.configService.get<sendGrid>('sendGrid');
    sgMail.setApiKey(sendgridApiKey.apiKey);
  }
  createHtmlContent(data: Record<string, any>, fileName: string): string {
    const templatePath = path.join(__dirname, 'template', fileName);
    return pug.renderFile(templatePath, { ...data });
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
      html: this.createHtmlContent({ title, content }, 'email_template.pug'),
    }));

    try {
      await sgMail.send(messages, true);
    } catch (error) {
      throw new InternalServerErrorException('Error sending email:', error);
    }
  }

  async sendUserSuspendedEmail(
    recipients: string[],
    subject: string,
    lastName: string,
    firstName: string,
    reason: string,
    phone: string,
  ): Promise<void> {
    const sendGrid = this.configService.get<sendGrid>('sendGrid');

    const messages = recipients.map((recipient) => ({
      to: recipient,
      from: sendGrid.sender_address,
      subject,
      html: this.createHtmlContent(
        { reason, phone, firstName, lastName, email: recipient },
        'user_banned.pug',
      ),
    }));

    try {
      await sgMail.send(messages, true);
    } catch (error) {
      throw new InternalServerErrorException('Error sending email:', error);
    }
  }

  async sendUserUnSuspendedEmail(
    recipients: string[],
    subject: string,
    lastName: string,
    firstName: string,
    phone: string,
  ): Promise<void> {
    const sendGrid = this.configService.get<sendGrid>('sendGrid');

    const messages = recipients.map((recipient) => ({
      to: recipient,
      from: sendGrid.sender_address,
      subject,
      html: this.createHtmlContent(
        { phone, firstName, lastName, email: recipient },
        'user_unbanned.pug',
      ),
    }));

    try {
      await sgMail.send(messages, true);
    } catch (error) {
      throw new InternalServerErrorException('Error sending email:', error);
    }
  }
}
