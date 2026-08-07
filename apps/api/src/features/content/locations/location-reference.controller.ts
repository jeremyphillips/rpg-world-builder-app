import type { Request, Response } from 'express'

import { HttpError } from '../../../lib/http-error'
import { authorizeCampaignParticipantAccess } from '../../campaign'
import { resolveCharacterLocationReferences } from './resolve-location-reference'

export async function listCharacterLocationReferences(req: Request, res: Response): Promise<void> {
  const { campaignId, characterId } = req.params as {
    campaignId: string
    characterId: string
  }
  const membership = req.campaignMembership
  if (!membership) {
    throw HttpError.forbidden('Not a member of this campaign')
  }

  const access = await authorizeCampaignParticipantAccess({
    campaignId,
    characterId,
    viewerUserId: req.user!.id,
    viewerRole: membership.campaignRole,
    viewerControlledCharacterIds: membership.pcCharacterIds,
  })

  if (!access.ok) {
    throw access.error
  }

  const references = await resolveCharacterLocationReferences({
    campaignId,
    characterId,
    authorization: { source: 'campaign-character-access' },
  })

  if (!references) {
    throw new HttpError(404, 'not_found', 'Character not found in campaign.')
  }

  res.status(200).json({ locationReferences: references })
}
