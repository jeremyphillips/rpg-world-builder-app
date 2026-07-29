import type { Request, Response } from 'express'
import { buildContentViewerFromCampaignContext } from '@rpg/contracts'

import { HttpError } from '../../../lib/http-error'
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
  const viewer = buildContentViewerFromCampaignContext(
    membership
      ? {
          campaignRole: membership.campaignRole,
          pcCharacterIds: membership.pcCharacterIds,
        }
      : undefined,
  )
  const references = await resolveCharacterOrganizationReferences({
    campaignId,
    characterId,
    viewer,
  })

  if (!references) {
    throw new HttpError(404, 'not_found', 'Character not found in campaign.')
  }

  res.status(200).json({ organizationReferences: references })
}
