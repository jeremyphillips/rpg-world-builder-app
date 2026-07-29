import type { Request, Response } from 'express'

import { HttpError } from '../../lib/http-error'
import { authorizeCampaignCharacterAccess } from './campaign-character-access.service'

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
    viewerControlledCharacterIds: membership.controlledCharacterIds,
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
