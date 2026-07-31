export const MESSAGES_MODE_QUERY = 'mode'
export const MESSAGES_MODE_CAMPAIGNS = 'campaigns'
export const MESSAGES_FROM_QUERY = 'from'
export const MESSAGES_CAMPAIGN_ID_QUERY = 'campaignId'

export function isMessagesCampaignsMode(search: string): boolean {
  const params = new URLSearchParams(search)
  return params.get(MESSAGES_MODE_QUERY) === MESSAGES_MODE_CAMPAIGNS
}

export function getMessagesCampaignId(search: string): string | undefined {
  const params = new URLSearchParams(search)
  const campaignId = params.get(MESSAGES_CAMPAIGN_ID_QUERY)?.trim()
  return campaignId || undefined
}

export function getMessagesFromConversationId(search: string): string | undefined {
  const params = new URLSearchParams(search)
  const from = params.get(MESSAGES_FROM_QUERY)?.trim()
  return from || undefined
}

export function buildMessagesSearchParams(input: {
  campaignId?: string
  from?: string
}): URLSearchParams {
  const params = new URLSearchParams()
  if (input.campaignId) params.set(MESSAGES_CAMPAIGN_ID_QUERY, input.campaignId)
  if (input.from) params.set(MESSAGES_FROM_QUERY, input.from)
  return params
}

export function appendMessagesCampaignScope(path: string, campaignId?: string): string {
  if (!campaignId) return path
  const separator = path.includes('?') ? '&' : '?'
  return `${path}${separator}${MESSAGES_CAMPAIGN_ID_QUERY}=${encodeURIComponent(campaignId)}`
}

export function flattenDirectConversationRecipients(
  recipientsByUserId: Record<string, { userId: string; displayName: string }>,
): Array<{ userId: string; displayName: string }> {
  return Object.values(recipientsByUserId).sort((left, right) =>
    left.displayName.localeCompare(right.displayName),
  )
}
