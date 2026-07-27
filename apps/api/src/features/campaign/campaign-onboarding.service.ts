import type {
  CampaignOnboardingContext,
  CampaignOnboardingEligibleCharacter,
  CompleteCampaignOnboardingInput,
  CompleteCampaignOnboardingResult,
} from '@rpg/contracts'
import {
  projectCharacterEligibilitySubjectFromCharacter,
  resolveCharacterCampaignEligibility,
} from '@rpg/contracts'

import { HttpError } from '../../lib/http-error'
import {
  buildCampaignContentEligibilityIndex,
  formatInviteCharacterSummary,
} from '../campaign-invite/campaign-invite-eligibility.lib'
import { resolveCampaignInviteEligibilityContext } from '../campaign-invite/resolve-campaign-invite-eligibility-context.lib'
import { findCampaignById } from './find-campaign-by-id'
import { findOpenParticipationForCharacter } from './participation/campaign-character-participation.repository'
import { listCharactersForUser } from '../character/character.service'
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

  const [characters, contentIndex, startingLevel] = await Promise.all([
    listCharactersForUser(userId),
    buildCampaignContentEligibilityIndex(campaignId),
    resolveCampaignInviteEligibilityContext(campaignId).then((value) => value.startingLevel),
  ])

  const results: CampaignOnboardingEligibleCharacter[] = []

  for (const character of characters) {
    if (character.characterType !== 'pc') continue

    const existingOpenParticipation = await findOpenParticipationForCharacter(character.id)
    let conflictingCampaignName: string | undefined
    if (existingOpenParticipation && existingOpenParticipation.campaignId !== campaignId) {
      const conflictingCampaign = await findCampaignById(existingOpenParticipation.campaignId)
      conflictingCampaignName = conflictingCampaign?.identity.name
    }

    const eligibility = resolveCharacterCampaignEligibility({
      subject: projectCharacterEligibilitySubjectFromCharacter(character),
      userId,
      campaignId,
      startingLevel,
      existingOpenParticipation,
      conflictingCampaignName,
      contentIndex,
      viewer: { kind: 'pc', characterIds: [character.id] },
    })

    results.push({
      characterId: character.id,
      name: character.name,
      summary: formatInviteCharacterSummary(character, contentIndex.contentById),
      eligibility,
    })
  }

  return results
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
