import { registerAs } from '@nestjs/config';
import { resolveAppEnvironment } from '../app/app-environment';
import type { Env } from '../env/env.schema';
import { getEnv } from '../env/env.schema';
import {
  getDefaultEmailDeliveryProvider,
  type EmailDeliveryProvider,
} from './email-delivery-provider';

const localEmailFromAddress = 'auth@sandicts.test';
const localSmtpHost = 'localhost';
const localWebAppBaseUrl = 'http://localhost:3001';

type EmailConfigBase = {
  fromAddress: string;
  fromName: string;
  replyToAddress: string | null;
  webAppBaseUrl: string;
};

type DevelopmentEmailConfig = EmailConfigBase & {
  provider: 'development';
};

type ResendEmailConfig = EmailConfigBase & {
  provider: 'resend';
  apiKey: string;
};

type SmtpEmailConfig = EmailConfigBase & {
  provider: 'smtp';
  host: string;
  password: string | null;
  port: number;
  secure: boolean;
  user: string | null;
};

type EmailConfig = DevelopmentEmailConfig | ResendEmailConfig | SmtpEmailConfig;

function buildEmailConfig(env: Env): EmailConfig {
  const environment = resolveAppEnvironment(env);
  const provider: EmailDeliveryProvider =
    env.EMAIL_DELIVERY_PROVIDER ?? getDefaultEmailDeliveryProvider(environment);
  const base = {
    fromAddress: env.EMAIL_FROM_ADDRESS ?? localEmailFromAddress,
    fromName: env.EMAIL_FROM_NAME,
    replyToAddress: env.EMAIL_REPLY_TO_ADDRESS ?? null,
    webAppBaseUrl: env.WEB_APP_BASE_URL ?? localWebAppBaseUrl,
  };

  switch (provider) {
    case 'development':
      return {
        ...base,
        provider,
      };
    case 'resend':
      return {
        ...base,
        provider,
        apiKey: requireConfigValue(env.RESEND_API_KEY, 'RESEND_API_KEY'),
      };
    case 'smtp':
      return {
        ...base,
        provider,
        host: env.SMTP_HOST ?? localSmtpHost,
        password: env.SMTP_PASSWORD ?? null,
        port: env.SMTP_PORT,
        secure: env.SMTP_SECURE,
        user: env.SMTP_USER ?? null,
      };
  }
}

function requireConfigValue(value: string | undefined, name: string) {
  if (value === undefined) {
    throw new Error(`Validated email configuration is missing ${name}`);
  }

  return value;
}

const emailConfig = registerAs('email', () => buildEmailConfig(getEnv()));

export { buildEmailConfig, emailConfig };
export type {
  DevelopmentEmailConfig,
  EmailConfig,
  ResendEmailConfig,
  SmtpEmailConfig,
};
