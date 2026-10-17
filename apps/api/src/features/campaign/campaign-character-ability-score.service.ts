import type {
  CampaignCharacterAbilityScorePatch,
  CampaignCharacterGetResponse,
} from '@rpg/contracts'
import { isCampaignManager } from '@rpg/contracts'

import { findPcById, updateCharacterAbilityScore } from '../character'
import { findOpenParticipation } from './participation/campaign-character-participation.repository'
import { authorizeCampaignCharacterAccess } from './campaign-character-access.service'

export async function patchCampaignCharacterAbilityScore(input: {
  campaignId: string
  characterId: string
  viewerUserId: string
  viewerRole: Parameters<typeof authorizeCampaignCharacterAccess>[0]['viewerRole']
  viewerControlledCharacterIds: readonly string[]
  patch: CampaignCharacterAbilityScorePatch
}): Promise<CampaignCharacterGetResponse | null | 'forbidden'> {
  if (!isCampaignManager(input.viewerRole)) {
    return 'forbidden'
  }

  const access = await authorizeCampaignCharacterAccess({
    campaignId: input.campaignId,
    characterId: input.characterId,
    viewerUserId: input.viewerUserId,
    viewerRole: input.viewerRole,
    viewerControlledCharacterIds: input.viewerControlledCharacterIds,
  })

  if (!access.ok) {
    return null
  }

  const { participation, capabilities } = access.context
  const updated = await updateCharacterAbilityScore(
    input.characterId,
    input.patch.ability,
    input.patch.score,
  )
  if (!updated) {
    return null
  }

  const refreshed = await findPcById(input.characterId)
  if (!refreshed) {
    return null
  }

  const participationAfter =
    (await findOpenParticipation({
      campaignId: input.campaignId,
      characterId: input.characterId,
    })) ?? participation

  return {
    character: refreshed,
    capabilities,
    participation: { roster: participationAfter.roster },
  }
}
