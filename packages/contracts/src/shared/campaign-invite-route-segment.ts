const INVITE_TOKEN_PATTERN = /^[0-9a-f]{64}$/
const INVITE_ID_PATTERN = /^[0-9a-f]{24}$/

export type CampaignInviteRouteSegment =
  | { kind: 'token'; value: string }
  | { kind: 'inviteId'; value: string }

/**
 * Parses a public `/campaign-invites/:segment` param before any API call.
 * Returns null for ambiguous or invalid segments.
 */
export function parseCampaignInviteRouteSegment(
  segment: string,
): CampaignInviteRouteSegment | null {
  const trimmed = segment.trim()
  if (!trimmed) return null

  const isToken = INVITE_TOKEN_PATTERN.test(trimmed)
  const isInviteId = INVITE_ID_PATTERN.test(trimmed)

  if (isToken && isInviteId) return null
  if (isToken) return { kind: 'token', value: trimmed }
  if (isInviteId) return { kind: 'inviteId', value: trimmed }

  return null
}
