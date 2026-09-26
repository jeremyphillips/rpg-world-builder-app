import { isCampaignPcMediaScopeKey, resolveCampaignPcMediaScopeKeys } from '@rpg/contracts'

import { HttpError } from '../../../lib/http-error'
import { CampaignMembershipModel } from '../../campaign'
import { listOpenParticipationsForCharacters } from '../../campaign/participation/campaign-character-participation.repository'
import { CharacterModel } from '../../character/character.model'
import type { MediaAssetDoc } from '../media-asset.model'
import { findMediaReferencesForAssetId } from '../media.repository'
import { assertMediaScopeAuthorized } from './scope.lib'
import { scopeFromDoc } from './to-media-asset'

async function canReadCampaignPcBoundAsset(input: {
  viewerUserId: string
  assetScopeKey: string
  characterId: string
  characterOwnerUserId: string
}): Promise<boolean> {
  if (!isCampaignPcMediaScopeKey(input.assetScopeKey)) {
    return false
  }

  const participations = await listOpenParticipationsForCharacters([input.characterId])
  for (const participation of participations) {
    const peerScopeKeys = resolveCampaignPcMediaScopeKeys({
      campaignId: participation.campaignId,
      characterOwnerUserId: input.characterOwnerUserId,
    })
    if (!peerScopeKeys.includes(input.assetScopeKey)) {
      continue
    }

    const membership = await CampaignMembershipModel.findOne({
      campaignId: participation.campaignId,
      userId: input.viewerUserId,
    })
      .select('_id')
      .lean<{ _id: string } | null>()

    if (membership) {
      return true
    }
  }

  return false
}

/** Scope auth, then campaign PC peer scopes for assets referenced on participating characters. */
export async function assertMediaAssetReadable(
  doc: MediaAssetDoc,
  viewerUserId: string,
): Promise<void> {
  try {
    await assertMediaScopeAuthorized(scopeFromDoc(doc), viewerUserId, 'read')
    return
  } catch (error) {
    if (!(error instanceof HttpError) || error.status !== 403) {
      throw error
    }
  }

  const references = await findMediaReferencesForAssetId(doc._id)
  for (const reference of references) {
    if (reference.subjectKind !== 'character') {
      continue
    }

    const character = await CharacterModel.findById(reference.subjectId)
      .select('userId')
      .lean<{ userId: string } | null>()

    if (!character) {
      continue
    }

    const allowed = await canReadCampaignPcBoundAsset({
      viewerUserId,
      assetScopeKey: doc.scopeKey,
      characterId: reference.subjectId,
      characterOwnerUserId: character.userId,
    })

    if (allowed) {
      return
    }
  }

  throw HttpError.forbidden('Insufficient permissions to view media.')
}
