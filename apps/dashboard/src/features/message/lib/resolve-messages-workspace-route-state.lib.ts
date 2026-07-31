import {
  getMessagesCampaignId,
  getMessagesFromConversationId,
  getMessagesToRecipientUserId,
} from './messages-workspace-routing.lib'

export type MessagesWorkspaceRouteState = {
  isNewRoute: boolean
  routeConversationId?: string
  isThreadRoute: boolean
  fromConversationId?: string
  toRecipientUserId?: string
  activeConversationId?: string
  campaignId?: string
  showLeftOnMobile: boolean
  showRightOnMobile: boolean
  showNewNeutralRight: boolean
  showDirectEmptyRight: boolean
  showDraftThreadRight: boolean
}

export function resolveMessagesWorkspaceRouteState(input: {
  search: string
  isNewRoute: boolean
  /** Child `:conversationId` param — only set when the thread child route is active. */
  conversationId?: string
}): MessagesWorkspaceRouteState {
  const isNewRoute = input.isNewRoute
  const routeConversationId = isNewRoute ? undefined : input.conversationId
  const isThreadRoute = Boolean(routeConversationId)
  const fromConversationId = getMessagesFromConversationId(input.search)
  const toRecipientUserId = getMessagesToRecipientUserId(input.search)
  const activeConversationId = routeConversationId ?? fromConversationId
  const campaignId = getMessagesCampaignId(input.search)
  const showDraftThreadRight = isNewRoute && Boolean(toRecipientUserId)

  return {
    isNewRoute,
    routeConversationId,
    isThreadRoute,
    fromConversationId,
    toRecipientUserId,
    activeConversationId,
    campaignId,
    showLeftOnMobile: !isThreadRoute && !showDraftThreadRight,
    showRightOnMobile: isThreadRoute || showDraftThreadRight,
    showNewNeutralRight: isNewRoute && !fromConversationId && !toRecipientUserId,
    showDirectEmptyRight: !isNewRoute && !isThreadRoute,
    showDraftThreadRight,
  }
}
