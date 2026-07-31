import { ROUTES } from '@/app/routes'

import { getMessagesFromConversationId, isMessagesNewRoute } from './messages-workspace-routing.lib'

export function resolveMessagesClearScopePath(input: { pathname: string; search: string }): string {
  if (isMessagesNewRoute(input.pathname)) {
    const from = getMessagesFromConversationId(input.search)
    return ROUTES.messages.new(from ? { from } : undefined)
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
    const from = getMessagesFromConversationId(input.search)
    return ROUTES.messages.new(from ? { from } : undefined)
  }

  return ROUTES.messages.list
}
