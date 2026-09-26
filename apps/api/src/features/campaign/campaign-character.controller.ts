import type { Request, Response } from 'express'

import type {
  CampaignParticipatingCharacterStatusPatch,
  CharacterMediaPatchInput,
} from '@rpg/contracts'

import { HttpError } from '../../lib/http-error'
import { authorizeCampaignCharacterAccess } from './campaign-character-access.service'
import { patchCampaignCharacterMedia } from './campaign-character-media.service'
import { patchCampaignCharacterStatus } from './campaign-character-status.service'
import { listCampaignCharactersForViewer } from './list-campaign-characters.service'

export async function listCampaignCharacters(req: Request, res: Response): Promise<void> {
  const { campaignId } = req.params as { campaignId: string }
  const membership = req.campaignMembership
  if (!membership) {
    throw HttpError.forbidden('Not a member of this campaign')
  }

  const characters = await listCampaignCharactersForViewer({
    campaignId,
    viewerRole: membership.campaignRole,
    viewerControlledCharacterIds: membership.pcCharacterIds,
  })

  res.status(200).json({ characters })
}

export async function getCampaignCharacter(req: Request, res: Response): Promise<void> {
  const { campaignId, characterId } = req.params as {
    campaignId: string
    characterId: string
  }
  const membership = req.campaignMembership
  if (!membership) {
    throw HttpError.forbidden('Not a member of this campaign')
  }

  const access = await authorizeCampaignCharacterAccess({
    campaignId,
    characterId,
    viewerUserId: req.user!.id,
    viewerRole: membership.campaignRole,
    viewerControlledCharacterIds: membership.pcCharacterIds,
  })

  if (!access.ok) {
    throw access.error
  }

  const { character, participation, capabilities } = access.context
  res.status(200).json({
    character,
    capabilities,
    participation: { roster: participation.roster },
  })
}

export async function patchCampaignCharacterMediaHandler(
  req: Request,
  res: Response,
): Promise<void> {
  const { campaignId, characterId } = req.params as {
    campaignId: string
    characterId: string
  }
  const membership = req.campaignMembership
  if (!membership) {
    throw HttpError.forbidden('Not a member of this campaign')
  }

  const result = await patchCampaignCharacterMedia({
    campaignId,
    characterId,
    viewerUserId: req.user!.id,
    viewerRole: membership.campaignRole,
    viewerControlledCharacterIds: membership.pcCharacterIds,
    patch: req.body as CharacterMediaPatchInput,
  })

  if (result === null) {
    throw new HttpError(404, 'not_found', 'Character not found.')
  }
  if (result === 'forbidden') {
    throw HttpError.forbidden('Insufficient permissions to update character images.')
  }
  if (result === 'stale_revision') {
    throw new HttpError(
      409,
      'conflict',
      'Character media was updated elsewhere. Reload and try again.',
    )
  }
  if (result === 'validation_failed') {
    throw HttpError.badRequest('Character media failed validation.')
  }
  if (result === 'asset_unavailable') {
    throw HttpError.badRequest('One or more media assets are unavailable.')
  }

  res.status(200).json(result)
}

export async function patchCampaignCharacterStatusHandler(
  req: Request,
  res: Response,
): Promise<void> {
  const { campaignId, characterId } = req.params as {
    campaignId: string
    characterId: string
  }
  const membership = req.campaignMembership
  if (!membership) {
    throw HttpError.forbidden('Not a member of this campaign')
  }

  const result = await patchCampaignCharacterStatus({
    campaignId,
    characterId,
    viewerUserId: req.user!.id,
    viewerRole: membership.campaignRole,
    viewerControlledCharacterIds: membership.pcCharacterIds,
    patch: req.body as CampaignParticipatingCharacterStatusPatch,
  })

  if (result === null) {
    throw new HttpError(404, 'not_found', 'Character not found.')
  }
  if (result === 'forbidden') {
    throw HttpError.forbidden('Insufficient permissions to update character status.')
  }

  res.status(200).json(result)
}
