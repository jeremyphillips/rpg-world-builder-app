'use client'

import * as React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import {
  INVALID_CAMPAIGN_SCOPE_COPY,
  isCampaignIdAccessible,
  stripCampaignIdFromSearch,
} from './filter-url-state.lib'

export { INVALID_CAMPAIGN_SCOPE_COPY }

export type UseInvalidCampaignScopeNoticeOptions = {
  /** When false, defer client-side strip until campaign options have loaded. */
  campaignsSettled?: boolean
}

export function useInvalidCampaignScopeNotice(
  campaignId: string | undefined,
  accessibleCampaignIds: readonly string[],
  options: UseInvalidCampaignScopeNoticeOptions = {},
) {
  const campaignsSettled = options.campaignsSettled ?? true
  const navigate = useNavigate()
  const location = useLocation()
  const [showNotice, setShowNotice] = React.useState(false)
  const strippedScopeRef = React.useRef<string | null>(null)
  const previousCampaignIdRef = React.useRef(campaignId)

  React.useEffect(() => {
    if (
      !campaignsSettled ||
      !campaignId ||
      isCampaignIdAccessible(campaignId, accessibleCampaignIds)
    ) {
      return
    }
    if (strippedScopeRef.current === campaignId) return

    strippedScopeRef.current = campaignId
    setShowNotice(true)
    navigate(`${location.pathname}${stripCampaignIdFromSearch(location.search)}`, { replace: true })
  }, [
    accessibleCampaignIds,
    campaignId,
    campaignsSettled,
    location.pathname,
    location.search,
    navigate,
  ])

  React.useEffect(() => {
    if (previousCampaignIdRef.current === campaignId) return
    previousCampaignIdRef.current = campaignId
    strippedScopeRef.current = null
    setShowNotice(false)
  }, [campaignId])

  return {
    showInvalidScopeNotice: showNotice,
    dismissInvalidScopeNotice: () => setShowNotice(false),
  }
}
