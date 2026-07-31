'use client'

import * as React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { useInvalidCampaignScopeNotice } from '@/lib/filters'

import { useConversations } from '../hooks/use-conversations'
import { resolveInvalidScopeRedirectPath } from '../lib/messages-campaign-scope-navigation.lib'
import type { MessagesWorkspaceRouteState } from '../lib/resolve-messages-workspace-route-state.lib'

export function useMessagesCampaignScopeEffects(
  routeState: Pick<
    MessagesWorkspaceRouteState,
    'campaignId' | 'isNewRoute' | 'isThreadRoute' | 'routeConversationId'
  > & {
    accessibleCampaignIds: readonly string[]
  },
) {
  const navigate = useNavigate()
  const location = useLocation()
  const { data } = useConversations(routeState.campaignId)
  const clientInvalidScope = useInvalidCampaignScopeNotice(
    routeState.campaignId,
    routeState.accessibleCampaignIds,
  )
  const [showApiInvalidScopeNotice, setShowApiInvalidScopeNotice] = React.useState(false)
  const strippedScopeRef = React.useRef<string | null>(null)
  const previousCampaignIdRef = React.useRef(routeState.campaignId)

  React.useEffect(() => {
    if (!routeState.campaignId || !data?.scopeInvalid) return
    if (strippedScopeRef.current === routeState.campaignId) return
    strippedScopeRef.current = routeState.campaignId
    setShowApiInvalidScopeNotice(true)

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
    if (previousCampaignIdRef.current === routeState.campaignId) return
    previousCampaignIdRef.current = routeState.campaignId
    strippedScopeRef.current = null
    setShowApiInvalidScopeNotice(false)
  }, [routeState.campaignId])

  return {
    scope: data?.scope,
    scopedCount: data?.scopedCount,
    hiddenCount: data?.hiddenCount,
    loadedCount: data?.items.length ?? 0,
    hasMoreConversations: Boolean(data?.nextCursor),
    showInvalidScopeNotice: clientInvalidScope.showInvalidScopeNotice || showApiInvalidScopeNotice,
    dismissInvalidScopeNotice: () => {
      clientInvalidScope.dismissInvalidScopeNotice()
      setShowApiInvalidScopeNotice(false)
    },
  }
}
