interface ISendEmailObj {
  recipientEmail: string;
  recipientName: string;
  html: string;
  subject: string;
  textPart: string;
  customID: string;
}

export type { ISendEmailObj };
