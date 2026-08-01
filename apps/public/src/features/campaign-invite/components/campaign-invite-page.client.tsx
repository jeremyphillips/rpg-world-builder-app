'use client'

import { useCallback, useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import { ApiError, crossAppCampaignOnboardingPath } from '@rpg/contracts'
import { persistCampaignSelectionBestEffort } from '@rpg/api-client'
import { CampaignInviteReviewContent, resolveInviteViewState } from '@rpg/campaign-invite'

import { ROUTES } from '@/lib/routes'
import { useSession } from '@/features/auth/hooks/use-session'
import { logout } from '@/features/auth/api/auth-client'

import {
  acceptCampaignInviteByToken,
  invalidateCampaignInviteAcceptQueries,
} from '../api/campaign-invite-client'
import { useCampaignInviteResolution } from '../hooks/use-campaign-invite-resolution'

type CampaignInvitePageProps = {
  token: string
}

export function CampaignInvitePage({ token }: CampaignInvitePageProps) {
  const queryClient = useQueryClient()
  const { data: session, isPending: isSessionPending } = useSession()
  const {
    data: resolution,
    isPending: isResolutionPending,
    isError: isResolutionError,
    error: resolutionError,
  } = useCampaignInviteResolution(token)
  const [acceptError, setAcceptError] = useState<string | null>(null)
  const [isAccepting, setIsAccepting] = useState(false)

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

  const handleAccept = useCallback(() => {
    setIsAccepting(true)
    setAcceptError(null)

    void acceptCampaignInviteByToken(token)
      .then(async (result) => {
        await persistCampaignSelectionBestEffort(result.campaignId)
        await invalidateCampaignInviteAcceptQueries(queryClient)
        // Invite handoff — plain onboarding entry, not recovery routing.
        window.location.assign(crossAppCampaignOnboardingPath(result.campaignId))
      })
      .catch((error: unknown) => {
        setIsAccepting(false)
        setAcceptError(
          error instanceof ApiError ? error.message : 'Could not accept this invitation.',
        )
      })
  }, [queryClient, token])

  const handleContinue = useCallback((campaignId: string) => {
    // Invite handoff — plain onboarding entry, not recovery routing.
    window.location.assign(crossAppCampaignOnboardingPath(campaignId))
  }, [])

  return (
    <CampaignInviteReviewContent
      viewState={viewState}
      returnTo={returnTo}
      acceptError={acceptError}
      onAccept={handleAccept}
      onContinue={handleContinue}
      navigation={{
        homeHref: ROUTES.home,
        onUseAnotherAccount: (loginHref) => {
          void logout().then(() => {
            window.location.assign(loginHref)
          })
        },
      }}
    />
  )
}
