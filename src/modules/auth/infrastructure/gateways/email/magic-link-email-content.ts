type MagicLinkEmailContent = {
  html: string;
  subject: string;
  text: string;
};

function buildMagicLinkEmailContent(
  magicLinkUrl: string,
  expiresAt: Date,
): MagicLinkEmailContent {
  const escapedUrl = escapeHtml(magicLinkUrl);
  const expiration = expiresAt.toISOString();

  return {
    subject: 'Sign in to Sandicts',
    text: [
      'Use this link to sign in to Sandicts:',
      magicLinkUrl,
      `This link expires at ${expiration} and can be used only once.`,
      'If you did not request this link, you can ignore this email.',
    ].join('\n\n'),
    html: [
      '<p>Use this link to sign in to Sandicts:</p>',
      `<p><a href="${escapedUrl}">Sign in to Sandicts</a></p>`,
      `<p>This link expires at ${expiration} and can be used only once.</p>`,
      '<p>If you did not request this link, you can ignore this email.</p>',
    ].join(''),
  };
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

export { buildMagicLinkEmailContent };
export type { MagicLinkEmailContent };
