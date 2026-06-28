import type { CreateEmailOptions, CreateEmailResponse } from 'resend';

type ResendEmailClient = {
  emails: {
    send(payload: CreateEmailOptions): Promise<CreateEmailResponse>;
  };
};

export type { ResendEmailClient };
