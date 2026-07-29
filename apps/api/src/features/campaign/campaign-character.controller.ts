import type { Request, Response } from 'express'

import { HttpError } from '../../lib/http-error'
import { authorizeCampaignCharacterAccess } from './campaign-character-access.service'
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
