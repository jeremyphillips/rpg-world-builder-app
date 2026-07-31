export const MESSAGES_FROM_QUERY = 'from'
export const MESSAGES_TO_QUERY = 'to'
export const MESSAGES_CAMPAIGN_ID_QUERY = 'campaignId'
export const MESSAGES_NEW_ROUTE_SEGMENT = 'new'
export const MESSAGES_ROUTE_SEGMENT = 'messages'

const LEGACY_MESSAGES_MODE_QUERY = 'mode'
const LEGACY_MESSAGES_MODE_CAMPAIGNS = 'campaigns'

/** Strip retired `?mode=campaigns` query params; returns next search or null when unchanged. */
export function stripLegacyMessagesCampaignsModeSearch(search: string): string | null {
  const params = new URLSearchParams(search)
  if (params.get(LEGACY_MESSAGES_MODE_QUERY) !== LEGACY_MESSAGES_MODE_CAMPAIGNS) {
    return null
  }

  params.delete(LEGACY_MESSAGES_MODE_QUERY)
  const query = params.toString()
  return query ? `?${query}` : ''
}

/** True when the active child route is `/messages/new` (basename-safe). */
export function isMessagesNewRoute(pathname: string): boolean {
  const segments = pathname.split('/').filter(Boolean)
  const messagesIndex = segments.lastIndexOf(MESSAGES_ROUTE_SEGMENT)

  return (
    messagesIndex !== -1 &&
    segments[messagesIndex + 1] === MESSAGES_NEW_ROUTE_SEGMENT &&
    segments.length === messagesIndex + 2
  )
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

export function getMessagesToRecipientUserId(search: string): string | undefined {
  const params = new URLSearchParams(search)
  const to = params.get(MESSAGES_TO_QUERY)?.trim()
  return to || undefined
}

export function buildMessagesSearchParams(input: {
  campaignId?: string
  from?: string
  to?: string
}): URLSearchParams {
  const params = new URLSearchParams()
  if (input.campaignId) params.set(MESSAGES_CAMPAIGN_ID_QUERY, input.campaignId)
  if (input.from) params.set(MESSAGES_FROM_QUERY, input.from)
  if (input.to) params.set(MESSAGES_TO_QUERY, input.to)
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
