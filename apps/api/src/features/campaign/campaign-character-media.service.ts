import type { CampaignCharacterGetResponse, CharacterMediaPatchInput } from '@rpg/contracts'

import { findPcById } from '../character'
import { updateCharacterMediaRecord } from '../character/lib/update-character-media.lib'
import { authorizeCampaignCharacterAccess } from './campaign-character-access.service'
import {
  assertCampaignCharacterMediaPatchAllowed,
  resolveCampaignCharacterMediaWriteScope,
} from './lib/resolve-campaign-character-media-patch.lib'

export async function patchCampaignCharacterMedia(input: {
  campaignId: string
  characterId: string
  viewerUserId: string
  viewerRole: Parameters<typeof authorizeCampaignCharacterAccess>[0]['viewerRole']
  viewerControlledCharacterIds: readonly string[]
  patch: CharacterMediaPatchInput
}): Promise<
  | CampaignCharacterGetResponse
  | null
  | 'stale_revision'
  | 'validation_failed'
  | 'asset_unavailable'
  | 'forbidden'
> {
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

  const { character, participation, capabilities } = access.context

  if (
    !assertCampaignCharacterMediaPatchAllowed({
      context: access.context,
      viewerUserId: input.viewerUserId,
      viewerRole: input.viewerRole,
    })
  ) {
    return 'forbidden'
  }

  const { scope, additionalAssetScopeKeys } = resolveCampaignCharacterMediaWriteScope({
    campaignId: input.campaignId,
    characterOwnerUserId: character.userId,
    viewerUserId: input.viewerUserId,
    viewerRole: input.viewerRole,
  })

  const result = await updateCharacterMediaRecord({
    characterId: input.characterId,
    scope,
    patch: input.patch,
    additionalAssetScopeKeys,
  })

  if (!result.ok) {
    if (result.reason === 'not_found') return null
    return result.reason
  }

  const refreshed = await findPcById(input.characterId)
  if (!refreshed) return null

  return {
    character: refreshed,
    capabilities,
    participation: { roster: participation.roster },
  }
}
