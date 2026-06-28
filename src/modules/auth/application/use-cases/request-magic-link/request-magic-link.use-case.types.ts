type RequestMagicLinkUseCaseRequest = {
  email: string;
};

type RequestMagicLinkUseCaseResponse = {
  status: 'accepted';
};

export type { RequestMagicLinkUseCaseRequest, RequestMagicLinkUseCaseResponse };
