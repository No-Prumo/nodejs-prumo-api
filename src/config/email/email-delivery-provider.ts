import type { AppEnvironment } from '../app/app-environment';

const emailDeliveryProviderValues = ['development', 'smtp', 'resend'] as const;

type EmailDeliveryProvider = (typeof emailDeliveryProviderValues)[number];

function getDefaultEmailDeliveryProvider(
  environment: AppEnvironment,
): EmailDeliveryProvider {
  switch (environment) {
    case 'local':
      return 'smtp';
    case 'test':
      return 'development';
    case 'staging':
    case 'production':
      return 'resend';
  }
}

export { emailDeliveryProviderValues, getDefaultEmailDeliveryProvider };
export type { EmailDeliveryProvider };
