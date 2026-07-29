import type { Request, Response } from 'express'

import { HttpError } from '../../../lib/http-error'
import { authorizeCampaignCharacterAccess } from '../../campaign/campaign-character-access.service'
import { resolveCharacterOrganizationReferences } from './resolve-organization-reference'

export async function listCharacterOrganizationReferences(
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

  const references = await resolveCharacterOrganizationReferences({
    campaignId,
    characterId,
    authorization: { source: 'campaign-character-access' },
  })

  if (!references) {
    throw new HttpError(404, 'not_found', 'Character not found in campaign.')
  }

  res.status(200).json({ organizationReferences: references })
}
