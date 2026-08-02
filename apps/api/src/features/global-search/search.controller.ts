import type { Request, Response } from 'express'

import { HttpError } from '../../lib/http-error'
import { collectGlobalSearchCatalog } from './search.service'

export async function getSearchCatalog(req: Request, res: Response): Promise<void> {
  const membership = req.campaignMembership
  if (!membership) {
    throw HttpError.forbidden('Not a member of this campaign')
  }

  const catalog = await collectGlobalSearchCatalog({
    campaignId: membership.campaignId,
    viewerRole: membership.campaignRole,
    viewerControlledCharacterIds: membership.pcCharacterIds,
  })

  res.status(200).json(catalog)
}
