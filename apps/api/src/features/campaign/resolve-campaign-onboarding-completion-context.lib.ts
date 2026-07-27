import type { CompleteCampaignOnboardingResult } from '@rpg/contracts'

import { HttpError } from '../../lib/http-error'
import {
  loadCampaignViewerParticipationContext,
  type CampaignViewerParticipationContext,
} from './resolve-campaign-viewer-participation-context.lib'

export type CampaignOnboardingCharacterSource =
  | { kind: 'new' }
  | { kind: 'existing'; characterId: string }

export type CampaignOnboardingCompletionContext = {
  campaignId: string
  membershipId: string
  participation: CampaignViewerParticipationContext
}

export type CampaignOnboardingCompletionContextResult =
  | { kind: 'idempotent'; result: CompleteCampaignOnboardingResult }
  | { kind: 'ready'; context: CampaignOnboardingCompletionContext }

function resolveIdempotentCompleteResult(
  campaignId: string,
  activeCharacterIds: string[],
  characterSource: CampaignOnboardingCharacterSource,
): CompleteCampaignOnboardingResult | null {
  if (activeCharacterIds.length === 0) return null

  if (characterSource.kind === 'existing') {
    if (!activeCharacterIds.includes(characterSource.characterId)) {
      throw new HttpError(
        409,
        'conflict',
        'Campaign onboarding was already completed with a different character.',
      )
    }

    return { campaignId, characterId: characterSource.characterId }
  }

  return { campaignId, characterId: activeCharacterIds[0]! }
}

export async function resolveCampaignOnboardingCompletionContext({
  campaignId,
  userId,
  characterSource,
}: {
  campaignId: string
  userId: string
  characterSource: CampaignOnboardingCharacterSource
}): Promise<CampaignOnboardingCompletionContextResult> {
  const participation = await loadCampaignViewerParticipationContext({ campaignId, userId })
  if (!participation) {
    throw new HttpError(404, 'not_found', 'Campaign not found.')
  }

  if (participation.participationState === 'active') {
    const idempotentResult = resolveIdempotentCompleteResult(
      campaignId,
      participation.activeCharacterIds,
      characterSource,
    )
    if (idempotentResult) {
      return { kind: 'idempotent', result: idempotentResult }
    }
  }

  if (participation.participationState === 'onboarding_incomplete') {
    return {
      kind: 'ready',
      context: {
        campaignId,
        membershipId: participation.membershipId,
        participation,
      },
    }
  }

  if (
    participation.participationState === 'staff' ||
    participation.participationState === 'observer'
  ) {
    throw new HttpError(
      403,
      'forbidden',
      'Campaign onboarding is only available to player members.',
    )
  }

  if (participation.participationState === 'invalid') {
    throw new HttpError(
      500,
      'integrity_error',
      'Campaign membership is in an inconsistent onboarding state.',
    )
  }

  throw new HttpError(404, 'not_found', 'Campaign not found.')
}
