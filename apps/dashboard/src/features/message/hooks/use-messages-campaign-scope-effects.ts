'use client'

import * as React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { useConversations } from '../hooks/use-conversations'
import { resolveInvalidScopeRedirectPath } from '../lib/messages-campaign-scope-navigation.lib'
import type { MessagesWorkspaceRouteState } from '../lib/resolve-messages-workspace-route-state.lib'

export function useMessagesCampaignScopeEffects(
  routeState: Pick<
    MessagesWorkspaceRouteState,
    'campaignId' | 'isNewRoute' | 'isThreadRoute' | 'routeConversationId'
  >,
) {
  const navigate = useNavigate()
  const location = useLocation()
  const { data } = useConversations(routeState.campaignId)
  const [showInvalidScopeNotice, setShowInvalidScopeNotice] = React.useState(false)
  const strippedScopeRef = React.useRef<string | null>(null)

  React.useEffect(() => {
    if (!routeState.campaignId || !data?.scopeInvalid) return
    if (strippedScopeRef.current === routeState.campaignId) return
    strippedScopeRef.current = routeState.campaignId
    setShowInvalidScopeNotice(true)

    navigate(
      resolveInvalidScopeRedirectPath({
        isThreadRoute: routeState.isThreadRoute,
        routeConversationId: routeState.routeConversationId,
        isNewRoute: routeState.isNewRoute,
        search: location.search,
      }),
      { replace: true },
    )
  }, [
    data?.scopeInvalid,
    location.search,
    navigate,
    routeState.campaignId,
    routeState.isNewRoute,
    routeState.isThreadRoute,
    routeState.routeConversationId,
  ])

  React.useEffect(() => {
    strippedScopeRef.current = null
    setShowInvalidScopeNotice(false)
  }, [routeState.campaignId])

  return {
    scope: data?.scope,
    scopedCount: data?.scopedCount,
    hiddenCount: data?.hiddenCount,
    showInvalidScopeNotice,
    dismissInvalidScopeNotice: () => setShowInvalidScopeNotice(false),
  }
}
