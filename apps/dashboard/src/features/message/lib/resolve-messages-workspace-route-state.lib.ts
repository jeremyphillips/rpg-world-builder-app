import {
  getMessagesCampaignId,
  getMessagesFromConversationId,
} from './messages-workspace-routing.lib'

export type MessagesWorkspaceRouteState = {
  isNewRoute: boolean
  routeConversationId?: string
  isThreadRoute: boolean
  fromConversationId?: string
  activeConversationId?: string
  campaignId?: string
  showLeftOnMobile: boolean
  showRightOnMobile: boolean
  showNewNeutralRight: boolean
  showDirectEmptyRight: boolean
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
  const activeConversationId = routeConversationId ?? fromConversationId
  const campaignId = getMessagesCampaignId(input.search)

  return {
    isNewRoute,
    routeConversationId,
    isThreadRoute,
    fromConversationId,
    activeConversationId,
    campaignId,
    showLeftOnMobile: isNewRoute || !isThreadRoute,
    showRightOnMobile: isThreadRoute,
    showNewNeutralRight: isNewRoute && !fromConversationId,
    showDirectEmptyRight: !isNewRoute && !isThreadRoute,
  }
}
