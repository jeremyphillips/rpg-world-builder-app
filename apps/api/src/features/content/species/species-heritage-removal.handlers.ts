import type { Request, Response } from 'express'

import { getSpeciesHeritageRemovalAvailability } from './species-heritage-removal.service'

export async function getSpeciesHeritageRemovalAvailabilityHandler(
  req: Request,
  res: Response,
): Promise<void> {
  const { campaignId, entityId } = req.params as { campaignId: string; entityId: string }
  const availability = await getSpeciesHeritageRemovalAvailability(campaignId, entityId)
  res.status(200).json({ availability })
}
