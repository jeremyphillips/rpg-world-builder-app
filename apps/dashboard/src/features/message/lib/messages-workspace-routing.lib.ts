export const MESSAGES_MODE_QUERY = 'mode'
export const MESSAGES_MODE_CAMPAIGNS = 'campaigns'
export const MESSAGES_FROM_QUERY = 'from'

export function isMessagesCampaignsMode(search: string): boolean {
  const params = new URLSearchParams(search)
  return params.get(MESSAGES_MODE_QUERY) === MESSAGES_MODE_CAMPAIGNS
}

export function getMessagesFromConversationId(search: string): string | undefined {
  const params = new URLSearchParams(search)
  const from = params.get(MESSAGES_FROM_QUERY)?.trim()
  return from || undefined
}

export function flattenDirectConversationRecipients(
  recipientsByUserId: Record<string, { userId: string; displayName: string }>,
): Array<{ userId: string; displayName: string }> {
  return Object.values(recipientsByUserId).sort((left, right) =>
    left.displayName.localeCompare(right.displayName),
  )
}
