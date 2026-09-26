import type {
  CampaignCharacterGetResponse,
  CampaignParticipatingCharacterStatusPatch,
} from '@rpg/contracts'
import { isCampaignManager } from '@rpg/contracts'

import { updateCharacterVital } from '../character'
import {
  findOpenParticipation,
  updateCampaignCharacterRoster,
} from './participation/campaign-character-participation.repository'
import { authorizeCampaignCharacterAccess } from './campaign-character-access.service'
import { findPcById } from '../character'

export async function patchCampaignCharacterStatus(input: {
  campaignId: string
  characterId: string
  viewerUserId: string
  viewerRole: Parameters<typeof authorizeCampaignCharacterAccess>[0]['viewerRole']
  viewerControlledCharacterIds: readonly string[]
  patch: CampaignParticipatingCharacterStatusPatch
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

  const timestamp = new Date().toISOString()
  const { participation, capabilities } = access.context

  if (input.patch.vital) {
    const updatedVital = await updateCharacterVital(input.characterId, input.patch.vital, {
      timestamp,
    })
    if (!updatedVital) {
      return null
    }
  }

  if (input.patch.roster) {
    const updatedRoster = await updateCampaignCharacterRoster({
      campaignId: input.campaignId,
      characterId: input.characterId,
      patch: input.patch.roster,
      timestamp,
    })
    if (!updatedRoster) {
      return null
    }
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
