import type {
  CampaignOnboardingContext,
  CampaignOnboardingEligibleCharacter,
  CompleteCampaignOnboardingInput,
  CompleteCampaignOnboardingResult,
} from '@rpg/contracts'

import { HttpError } from '../../lib/http-error'
import { listEligibleCharactersForCampaign } from '../campaign-invite/list-campaign-eligible-characters.lib'
import { findCampaignById } from './find-campaign-by-id'
import { getRulesetPatchRead } from '../vocabulary'
import { completeCampaignOnboarding } from './complete-campaign-onboarding-character.lib'
import { loadCampaignViewerParticipationContext } from './resolve-campaign-viewer-participation-context.lib'

async function loadCampaignStartingLevel(campaignId: string): Promise<number> {
  const patch = await getRulesetPatchRead(campaignId)
  return patch?.characterCreation.startingLevel ?? 1
}

export async function getCampaignOnboardingContext({
  campaignId,
  userId,
}: {
  campaignId: string
  userId: string
}): Promise<CampaignOnboardingContext> {
  const campaign = await findCampaignById(campaignId)
  if (!campaign) {
    throw new HttpError(404, 'not_found', 'Campaign not found.')
  }

  const participation = await loadCampaignViewerParticipationContext({ campaignId, userId })
  if (!participation) {
    throw new HttpError(404, 'not_found', 'Campaign not found.')
  }

  if (participation.participationState === 'active') {
    return {
      status: 'complete',
      campaignId,
      characterId: participation.activeCharacterIds[0],
    }
  }

  if (participation.participationState === 'onboarding_incomplete') {
    const startingLevel = await loadCampaignStartingLevel(campaignId)
    return {
      status: 'onboarding_incomplete',
      campaignId,
      campaign: {
        id: campaign.id,
        name: campaign.identity.name,
      },
      startingLevel,
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

export async function listEligibleCharactersForCampaignOnboarding({
  campaignId,
  userId,
}: {
  campaignId: string
  userId: string
}): Promise<CampaignOnboardingEligibleCharacter[]> {
  const context = await getCampaignOnboardingContext({ campaignId, userId })
  if (context.status !== 'onboarding_incomplete') {
    throw new HttpError(409, 'conflict', 'Campaign onboarding is already complete.')
  }

  return listEligibleCharactersForCampaign({ campaignId, userId })
}

export async function completeCampaignOnboardingForUser(
  input: CompleteCampaignOnboardingInput & {
    campaignId: string
    userId: string
    userEmail: string
  },
): Promise<CompleteCampaignOnboardingResult> {
  const result = await completeCampaignOnboarding(input)

  // TODO(notifications): notify campaign owners when onboarding completes.

  return result
}
