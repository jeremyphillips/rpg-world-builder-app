import type { CampaignEligibleCharacter } from '@rpg/contracts'
import {
  projectCharacterEligibilitySubjectFromCharacter,
  resolveCharacterCampaignEligibility,
} from '@rpg/contracts'

import { findCampaignById } from '../../find-campaign-by-id'
import { findOpenParticipationForCharacter } from '../campaign-character-participation.repository'
import { listCharactersForUser } from '../../../character/character.service'
import {
  buildCampaignContentEligibilityIndex,
  formatInviteCharacterSummary,
} from '../../../campaign-invite/campaign-invite-eligibility.lib'
import { resolveCampaignCharacterEligibilityContext } from './resolve-campaign-character-eligibility-context.lib'

export async function listEligibleCharactersForCampaign({
  campaignId,
  userId,
}: {
  campaignId: string
  userId: string
}): Promise<CampaignEligibleCharacter[]> {
  const [characters, contentIndex, startingLevel] = await Promise.all([
    listCharactersForUser(userId),
    buildCampaignContentEligibilityIndex(campaignId),
    resolveCampaignCharacterEligibilityContext(campaignId).then((value) => value.startingLevel),
  ])

  const results: CampaignEligibleCharacter[] = []

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
