'use client'

import * as React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { stripLegacyMessagesCampaignsModeSearch } from '../lib/messages-workspace-routing.lib'

/** Redirect legacy `?mode=campaigns` URLs to the unscoped messages workspace. */
export function useStripLegacyMessagesMode() {
  const location = useLocation()
  const navigate = useNavigate()

  React.useEffect(() => {
    const nextSearch = stripLegacyMessagesCampaignsModeSearch(location.search)
    if (nextSearch === null) return

    navigate(
      {
        pathname: location.pathname,
        search: nextSearch,
      },
      { replace: true },
    )
  }, [location.pathname, location.search, navigate])
}
