import type { Request, Response } from 'express'
import type { CreateCampaignInput } from '@rpg/contracts'

import { createCampaign } from './campaign.service'

export async function create(req: Request, res: Response): Promise<void> {
  // `req.body` is validated by `validate(createCampaignInputSchema)`; `req.user`
  // is guaranteed by `requireAuth` running before this handler.
  const { name } = req.body as CreateCampaignInput
  const campaign = await createCampaign({ name, createdBy: req.user!.id })
  res.status(201).json({ campaign })
}
