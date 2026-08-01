const INVITE_TOKEN_PATTERN = /^[0-9a-f]{64}$/

/** Validates a 64-char lowercase hex invite token. */
export function isCampaignInviteToken(value: string | undefined): value is string {
  return typeof value === 'string' && INVITE_TOKEN_PATTERN.test(value)
}

/**
 * Parses a public `/campaign-invites/:segment` param before any API call.
 * Returns the token when valid; null otherwise.
 */
export function parseCampaignInviteTokenSegment(segment: string): string | null {
  const trimmed = segment.trim()
  return isCampaignInviteToken(trimmed) ? trimmed : null
}
