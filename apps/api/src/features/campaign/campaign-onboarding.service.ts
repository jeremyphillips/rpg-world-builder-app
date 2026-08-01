import type {
  CampaignOnboardingContext,
  CampaignOnboardingEligibleCharacter,
  CompleteCampaignOnboardingInput,
  CompleteCampaignOnboardingResult,
} from '@rpg/contracts'

import { HttpError } from '../../lib/http-error'
import { listEligibleCharactersForCampaign } from './participation/character-assignment/list-campaign-eligible-characters.lib'
import { findCampaignById } from './find-campaign-by-id'
import { getRulesetPatchRead } from '../vocabulary'
import { completeCampaignOnboarding } from './complete-campaign-onboarding-character.lib'
import { loadCampaignOnboardingGate } from './load-campaign-onboarding-gate.lib'
import { throwFromCampaignOnboardingGate } from './map-campaign-onboarding-gate-error.lib'

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
  const gate = await loadCampaignOnboardingGate({ campaignId, userId })

  if (gate.kind === 'complete') {
    return {
      status: 'complete',
      campaignId,
      characterId: gate.characterId,
    }
  }

  if (gate.kind === 'not_found' || gate.kind === 'forbidden' || gate.kind === 'integrity_error') {
    throwFromCampaignOnboardingGate(gate)
  }

  const campaign = await findCampaignById(campaignId)
  if (!campaign) {
    throw new HttpError(404, 'not_found', 'Campaign not found.')
  }

  const startingLevel = await loadCampaignStartingLevel(campaignId)

  if (gate.mode === 'initial') {
    return {
      status: 'onboarding_incomplete',
      mode: 'initial',
      campaignId,
      campaign: {
        id: campaign.id,
        name: campaign.identity.name,
      },
      startingLevel,
    }
  }

  return {
    status: 'onboarding_incomplete',
    mode: 'reconnect',
    staleCharacterId: gate.characterId,
    campaignId,
    campaign: {
      id: campaign.id,
      name: campaign.identity.name,
    },
    startingLevel,
  }
}

export async function listEligibleCharactersForCampaignOnboarding({
  campaignId,
  userId,
}: {
  campaignId: string
  userId: string
}): Promise<CampaignOnboardingEligibleCharacter[]> {
  const gate = await loadCampaignOnboardingGate({ campaignId, userId })

  if (gate.kind === 'complete') {
    throw new HttpError(409, 'conflict', 'Campaign onboarding is already complete.')
  }

  if (gate.kind === 'not_found' || gate.kind === 'forbidden' || gate.kind === 'integrity_error') {
    throwFromCampaignOnboardingGate(gate)
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
