'use client'

import { useCallback, useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import {
  ApiError,
  crossAppCampaignOnboardingPath,
  type CampaignInviteRouteSegment,
} from '@rpg/contracts'

import { useSession } from '@/features/auth/hooks/use-session'

import {
  acceptCampaignInviteById,
  acceptCampaignInviteByToken,
  invalidateCampaignInviteAcceptQueries,
} from '../api/campaign-invite-client'
import { useCampaignInviteResolution } from '../hooks/use-campaign-invite-resolution'
import {
  buildCampaignInviteReturnTo,
  resolveInviteViewState,
} from '../lib/campaign-invite-page.lib'
import { renderInviteViewState } from '../lib/campaign-invite-page-view.client'

type CampaignInvitePageProps = {
  segment: CampaignInviteRouteSegment
}

export function CampaignInvitePage({ segment }: CampaignInvitePageProps) {
  const queryClient = useQueryClient()
  const { data: session, isPending: isSessionPending } = useSession()
  const {
    data: resolution,
    isPending: isResolutionPending,
    isError: isResolutionError,
    error: resolutionError,
  } = useCampaignInviteResolution(segment)
  const [acceptError, setAcceptError] = useState<string | null>(null)
  const [isAccepting, setIsAccepting] = useState(false)

  const returnTo = buildCampaignInviteReturnTo(segment)
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

  const handleAccept = useCallback(() => {
    setIsAccepting(true)
    setAcceptError(null)

    const acceptPromise =
      segment.kind === 'token'
        ? acceptCampaignInviteByToken(segment.value)
        : acceptCampaignInviteById(segment.value)

    void acceptPromise
      .then(async (result) => {
        await invalidateCampaignInviteAcceptQueries(queryClient)
        window.location.assign(crossAppCampaignOnboardingPath(result.campaignId))
      })
      .catch((error: unknown) => {
        setIsAccepting(false)
        setAcceptError(
          error instanceof ApiError ? error.message : 'Could not accept this invitation.',
        )
      })
  }, [queryClient, segment])

  const handleContinue = useCallback((campaignId: string) => {
    window.location.assign(crossAppCampaignOnboardingPath(campaignId))
  }, [])

  return renderInviteViewState(viewState, {
    returnTo,
    acceptError,
    onAccept: handleAccept,
    onContinue: handleContinue,
  })
}
