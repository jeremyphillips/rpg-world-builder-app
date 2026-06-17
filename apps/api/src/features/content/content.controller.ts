import type { Request, Response } from 'express'

import { getContentTypeConfig } from './content-types'
import { resolveCatalogForCampaign } from './content.service'

export async function listClasses(req: Request, res: Response): Promise<void> {
  // `campaignId` is validated by `requireCampaignRole` (membership) upstream.
  const { campaignId } = req.params as { campaignId: string }
  const config = getContentTypeConfig('classes')
  const classes = await resolveCatalogForCampaign(config, campaignId)
  res.status(200).json({ classes })
}
