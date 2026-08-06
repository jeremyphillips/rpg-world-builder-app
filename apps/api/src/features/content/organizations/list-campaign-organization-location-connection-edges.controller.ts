import type { Request, Response } from 'express'

import { loadCampaignOrganizationLocationConnectionEdges } from './load-campaign-organization-location-connection-edges'

export async function listCampaignOrganizationLocationConnectionEdges(
  req: Request,
  res: Response,
): Promise<void> {
  const { campaignId } = req.params as { campaignId: string }

  const edgesByLocationId = await loadCampaignOrganizationLocationConnectionEdges(campaignId)

  res.status(200).json({ edgesByLocationId })
}
