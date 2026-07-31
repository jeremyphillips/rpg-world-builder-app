import {
  getMessagesFromConversationId,
  isMessagesCampaignsMode,
} from './messages-workspace-routing.lib'

export type MessagesWorkspaceRouteState = {
  isCampaignsMode: boolean
  isNewRoute: boolean
  routeConversationId?: string
  isThreadRoute: boolean
  fromConversationId?: string
  activeConversationId?: string
  showLeftOnMobile: boolean
  showRightOnMobile: boolean
  showNewNeutralRight: boolean
  showDirectEmptyRight: boolean
}

export function resolveMessagesWorkspaceRouteState(input: {
  search: string
  newRouteMatch: unknown
  threadRouteMatch: { params: { conversationId?: string } } | null
}): MessagesWorkspaceRouteState {
  const isCampaignsMode = isMessagesCampaignsMode(input.search)
  const isNewRoute = Boolean(input.newRouteMatch)
  const routeConversationId = input.threadRouteMatch?.params.conversationId
  const isThreadRoute = Boolean(routeConversationId)
  const fromConversationId = getMessagesFromConversationId(input.search)
  const activeConversationId = routeConversationId ?? fromConversationId

  return {
    isCampaignsMode,
    isNewRoute,
    routeConversationId,
    isThreadRoute,
    fromConversationId,
    activeConversationId,
    showLeftOnMobile: isCampaignsMode ? false : isNewRoute || !isThreadRoute,
    showRightOnMobile: isCampaignsMode || isThreadRoute,
    showNewNeutralRight: isNewRoute && !fromConversationId,
    showDirectEmptyRight: !isCampaignsMode && !isNewRoute && !isThreadRoute,
  }
}
