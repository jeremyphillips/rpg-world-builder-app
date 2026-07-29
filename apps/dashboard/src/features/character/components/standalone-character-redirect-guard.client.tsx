'use client'

import type { ReactNode } from 'react'
import { useMemo } from 'react'
import { Navigate, useLocation, useParams } from 'react-router-dom'

import { PageLoadState } from '@/components/layout/page-load-state'
import { WidePage } from '@/components/layout/wide-page'
import { useCampaigns } from '@/features/campaign'

import { useCharacter } from '../hooks/use-character'
import { useCharacterRoutingContext } from '../hooks/use-character-routing-context'
import {
  buildStandaloneCharacterRedirectSearch,
  resolveStandaloneCharacterRedirectTarget,
} from '../lib/navigation/standalone-character-redirect.lib'

type StandaloneCharacterRedirectGuardProps = {
  children: ReactNode
}

/**
 * Canonicalizes owner standalone URLs to the campaign sheet when the character
 * has open participation and the viewer is an active campaign member.
 */
export function StandaloneCharacterRedirectGuard({
  children,
}: StandaloneCharacterRedirectGuardProps) {
  const { characterId } = useParams<{ characterId: string }>()
  const location = useLocation()
  const { data: campaigns } = useCampaigns()

  const {
    isPending: isCharacterPending,
    isError: isCharacterError,
    isSuccess: isCharacterSuccess,
  } = useCharacter(characterId)

  const { data: routingContext, isPending: isRoutingPending } = useCharacterRoutingContext(
    characterId,
    { enabled: isCharacterSuccess },
  )

  const redirectTarget = useMemo(() => {
    if (!characterId) return null

    return resolveStandaloneCharacterRedirectTarget({
      characterId,
      routingContext,
      campaigns,
      search: buildStandaloneCharacterRedirectSearch(new URLSearchParams(location.search)),
    })
  }, [campaigns, characterId, location.search, routingContext])

  if (isCharacterPending || (isCharacterSuccess && isRoutingPending)) {
    return (
      <WidePage spacing="relaxed">
        <PageLoadState isPending isError={false} defaultErrorLabel="Could not load character.">
          {null}
        </PageLoadState>
      </WidePage>
    )
  }

  if (redirectTarget) {
    return <Navigate to={redirectTarget} replace />
  }

  if (isCharacterError) {
    return children
  }

  return children
}
