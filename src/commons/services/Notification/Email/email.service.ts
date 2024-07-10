import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sgMail from '@sendgrid/mail';
import { sendGrid } from '../../../../configs';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly configService: ConfigService) {
    sgMail.setApiKey(this.configService.get<sendGrid>('sendGrid').apiKey);
  }

  async sendEmailWithTemplate({
    recipientEmail,
    templateId,
    dynamicTemplateData,
  }: {
    recipientEmail: string;
    templateId: string;
    dynamicTemplateData: Record<string, any>;
  }) {
    const sendGrid = this.configService.get<sendGrid>('sendGrid');
    const msg = {
      to: recipientEmail,
      from: {
        email: sendGrid.sender_address,
        name: 'ppnApp',
      },
      templateId: templateId,
      dynamic_template_data: dynamicTemplateData,
    };

    try {
      const response = await sgMail.send(msg);
      console.log({ response });
      this.logger.log(response);
    } catch (error) {
      this.logger.error(error);
    }
  }
}
