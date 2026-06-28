import type { SendMailOptions, SentMessageInfo, Transporter } from 'nodemailer';

type SmtpEmailTransport = Pick<Transporter, 'sendMail'> & {
  sendMail(options: SendMailOptions): Promise<SentMessageInfo>;
};

export type { SmtpEmailTransport };
