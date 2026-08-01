import type { CompleteCampaignOnboardingResult } from '@rpg/contracts'

import { HttpError } from '../../lib/http-error'
import { loadCampaignOnboardingGate } from './load-campaign-onboarding-gate.lib'
import { throwFromCampaignOnboardingGate } from './map-campaign-onboarding-gate-error.lib'

export type CampaignOnboardingCharacterSource =
  | { kind: 'new' }
  | { kind: 'existing'; characterId: string }

export type CampaignOnboardingCompletionContext = {
  campaignId: string
  membershipId: string
}

export type CampaignOnboardingCompletionContextResult =
  | { kind: 'idempotent'; result: CompleteCampaignOnboardingResult }
  | { kind: 'ready'; context: CampaignOnboardingCompletionContext }

function resolveIdempotentCompleteResult(
  campaignId: string,
  activeCharacterIds: readonly string[],
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
  const gate = await loadCampaignOnboardingGate({ campaignId, userId })

  if (gate.kind === 'complete') {
    const idempotentResult = resolveIdempotentCompleteResult(
      campaignId,
      gate.activeCharacterIds,
      characterSource,
    )
    if (idempotentResult) {
      return { kind: 'idempotent', result: idempotentResult }
    }

    throwFromCampaignOnboardingGate({
      kind: 'integrity_error',
      reason: 'ready_pc_without_active_character',
    })
  }

  if (gate.kind === 'not_found' || gate.kind === 'forbidden' || gate.kind === 'integrity_error') {
    throwFromCampaignOnboardingGate(gate)
  }

  return {
    kind: 'ready',
    context: {
      campaignId,
      membershipId: gate.membershipId,
    },
  }
}
