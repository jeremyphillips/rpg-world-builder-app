export const INVITE_REVIEW_COPY = {
  loading: {
    accepting: 'Accepting your invitation…',
    resolving: 'Checking your invitation status…',
  },
  unavailable: {
    title: 'Invitation unavailable',
  },
  revoked: {
    title: 'This invitation is no longer available',
    body: 'The campaign owner revoked this invitation. Ask them to send a new one if you still need access.',
    action: 'Return home',
  },
  expired: {
    title: 'This invitation has expired',
    body: 'Ask the campaign owner to send a new invitation.',
    action: 'Return home',
  },
  completed: {
    title: 'This invitation has already been completed.',
    bodyWithSession: 'Your campaign character is ready in the dashboard.',
    bodyWithoutSession: 'Sign in with the invited account to open your campaign character.',
    openCampaign: 'Open campaign',
    signIn: 'Sign in',
  },
  pendingReview: {
    accept: 'Accept invitation',
    continue: 'Continue to character setup',
  },
  emailMismatch: {
    title: 'Use the invited account',
    action: 'Use another account',
  },
  unauthenticated: {
    signIn: 'Sign in',
    createAccount: 'Create account',
    bodySuffix: 'Sign in or create an account to continue.',
  },
  home: 'Return home',
} as const
