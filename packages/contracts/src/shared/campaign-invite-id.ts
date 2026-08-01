const INVITE_ID_PATTERN = /^[0-9a-f]{24}$/

/** Validates a Mongo ObjectId-shaped campaign invite id (24-char lowercase hex). */
export function isCampaignInviteId(value: string | undefined): value is string {
  return typeof value === 'string' && INVITE_ID_PATTERN.test(value)
}
