import { useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

import { useSession } from '@/features/auth'
import { readStoredCampaignId, resolveLandingPath, useCampaigns } from '@/features/campaign'

/**
 * Sends a returning user from `/` to their remembered campaign exactly once per
 * page load. The flag is module-scoped (not per-mount) so revisiting `/` later
 * shows the picker instead of bouncing the user back into a campaign.
 */
let initialRedirectHandled = false

/**
 * Returns true while the landing decision is still in flight (session/campaigns
 * loading, or a redirect about to fire) so the caller can hold the picker back.
 */
export function useLandingRedirect(): boolean {
  const navigate = useNavigate()
  const { data: user, isPending: sessionPending } = useSession()
  const { data: campaigns, isPending: campaignsPending } = useCampaigns()

  const loading = sessionPending || campaignsPending

  const redirectTo = useMemo(
    () =>
      loading || initialRedirectHandled || !campaigns
        ? null
        : resolveLandingPath(campaigns, user, readStoredCampaignId()),
    [loading, campaigns, user],
  )

  useEffect(() => {
    if (redirectTo) {
      initialRedirectHandled = true
      navigate(redirectTo, { replace: true })
    }
  }, [redirectTo, navigate])

  return loading || redirectTo !== null
}
