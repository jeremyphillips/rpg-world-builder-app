'use client'

import { useEffect, useRef, useMemo, useState } from 'react'

import { ApiError, crossAppCampaignOnboardingPath } from '@rpg/contracts'

import { useSession } from '@/features/auth/hooks/use-session'

import { acceptCampaignInvite } from '../api/campaign-invite-client'
import { useCampaignInviteResolution } from '../hooks/use-campaign-invite-resolution'
import { resolveInviteViewState, shouldAutoAcceptInvite } from '../lib/campaign-invite-page.lib'
import { renderInviteViewState } from '../lib/campaign-invite-page-view.client'

type CampaignInvitePageProps = {
  token: string
}

export function CampaignInvitePage({ token }: CampaignInvitePageProps) {
  const { data: session, isPending: isSessionPending } = useSession()
  const {
    data: resolution,
    isPending: isResolutionPending,
    isError: isResolutionError,
    error: resolutionError,
  } = useCampaignInviteResolution(token)
  const [acceptError, setAcceptError] = useState<string | null>(null)
  const [isAccepting, setIsAccepting] = useState(false)
  const acceptStartedRef = useRef(false)

  const returnTo = `/campaign-invites/${token}`
  const resolutionErrorMessage =
    resolutionError instanceof ApiError
      ? resolutionError.message
      : 'Could not load this invitation.'

  const viewState = useMemo(
    () =>
      resolveInviteViewState({
        isSessionPending,
        isResolutionPending,
        isResolutionError,
        resolutionErrorMessage,
        resolution,
        sessionUser: session?.user,
        isAccepting,
      }),
    [
      isAccepting,
      isResolutionError,
      isResolutionPending,
      isSessionPending,
      resolution,
      resolutionErrorMessage,
      session?.user,
    ],
  )

  useEffect(() => {
    if (!shouldAutoAcceptInvite(viewState) || acceptStartedRef.current) {
      return
    }

    acceptStartedRef.current = true
    setIsAccepting(true)
    setAcceptError(null)

    void acceptCampaignInvite(token)
      .then((result) => {
        window.location.assign(crossAppCampaignOnboardingPath(result.campaignId, result.inviteId))
      })
      .catch((error: unknown) => {
        setIsAccepting(false)
        setAcceptError(
          error instanceof ApiError ? error.message : 'Could not accept this invitation.',
        )
      })
  }, [token, viewState])

  return renderInviteViewState(viewState, { returnTo, acceptError })
}
