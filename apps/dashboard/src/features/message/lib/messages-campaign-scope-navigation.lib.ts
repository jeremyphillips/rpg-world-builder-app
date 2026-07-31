import { ROUTES } from '@/app/routes'

import {
  getMessagesFromConversationId,
  getMessagesToRecipientUserId,
  isMessagesNewRoute,
} from './messages-workspace-routing.lib'

function buildNewMessagePath(search: string): string {
  const from = getMessagesFromConversationId(search)
  const to = getMessagesToRecipientUserId(search)
  return ROUTES.messages.new({
    ...(from ? { from } : {}),
    ...(to ? { to } : {}),
  })
}

export function resolveMessagesClearScopePath(input: { pathname: string; search: string }): string {
  if (isMessagesNewRoute(input.pathname)) {
    return buildNewMessagePath(input.search)
  }

  const isThreadRoute = /^\/messages\/[^/]+$/.test(input.pathname)
  if (isThreadRoute) {
    const conversationId = input.pathname.split('/').pop()
    if (conversationId) {
      return ROUTES.messages.detail(conversationId)
    }
  }

  return ROUTES.messages.list
}

export function resolveInvalidScopeRedirectPath(input: {
  isThreadRoute: boolean
  routeConversationId?: string
  isNewRoute: boolean
  search: string
}): string {
  if (input.isThreadRoute && input.routeConversationId) {
    return ROUTES.messages.detail(input.routeConversationId)
  }

  if (input.isNewRoute) {
    return buildNewMessagePath(input.search)
  }

  return ROUTES.messages.list
}
