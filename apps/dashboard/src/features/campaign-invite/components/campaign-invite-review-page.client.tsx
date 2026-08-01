'use client'

import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'

import { ApiError } from '@rpg/contracts'
import { CampaignInviteReviewContent, resolveInviteViewState } from '@rpg/campaign-invite'

import { ROUTES } from '@/app/routes'
import { useSession } from '@/features/auth/hooks/use-session'
import { usePersistCampaignSelection } from '@/features/campaign'

import {
  acceptCampaignInviteById,
  invalidateCampaignInviteAcceptQueries,
} from '../api/campaign-invite-client'
import { useCampaignInviteResolution } from '../hooks/use-campaign-invite-resolution'

type CampaignInviteReviewPageProps = {
  inviteId: string
}

export function CampaignInviteReviewPage({ inviteId }: CampaignInviteReviewPageProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const persistCampaignSelection = usePersistCampaignSelection()
  const { data: session, isPending: isSessionPending } = useSession()
  const {
    data: resolution,
    isPending: isResolutionPending,
    isError: isResolutionError,
    error: resolutionError,
  } = useCampaignInviteResolution(inviteId)
  const [acceptError, setAcceptError] = useState<string | null>(null)
  const [isAccepting, setIsAccepting] = useState(false)

  const returnTo = ROUTES.campaignInvites.detail(inviteId)
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

    void acceptCampaignInviteById(inviteId)
      .then(async (result) => {
        persistCampaignSelection(result.campaignId)
        await invalidateCampaignInviteAcceptQueries(queryClient, result.campaignId)
        navigate(ROUTES.campaign.onboarding(result.campaignId))
      })
      .catch((error: unknown) => {
        setIsAccepting(false)
        setAcceptError(
          error instanceof ApiError ? error.message : 'Could not accept this invitation.',
        )
      })
  }, [inviteId, navigate, persistCampaignSelection, queryClient])

  const handleContinue = useCallback(
    (campaignId: string) => {
      navigate(ROUTES.campaign.onboarding(campaignId))
    },
    [navigate],
  )

  return (
    <CampaignInviteReviewContent
      viewState={viewState}
      returnTo={returnTo}
      acceptError={acceptError}
      onAccept={handleAccept}
      onContinue={handleContinue}
      navigation={{ homeHref: ROUTES.home }}
    />
  )
}
