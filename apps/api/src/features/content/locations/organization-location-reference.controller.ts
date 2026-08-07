import type { Request, Response } from 'express'

import { HttpError } from '../../../lib/http-error'
import { resolveOrganizationLocationReferences } from './resolve-location-reference'

export async function listOrganizationLocationReferences(
  req: Request,
  res: Response,
): Promise<void> {
  const { campaignId, organizationId } = req.params as {
    campaignId: string
    organizationId: string
  }

  const references = await resolveOrganizationLocationReferences({
    campaignId,
    organizationId,
  })

  if (!references) {
    throw new HttpError(404, 'not_found', 'Organization not found in campaign.')
  }

  res.status(200).json({ locationReferences: references })
}
