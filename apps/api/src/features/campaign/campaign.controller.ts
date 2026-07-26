import type { Request, Response } from 'express'
import type { CreateCampaignInput, SelectCampaignInput, UpdateCampaignInput } from '@rpg/contracts'

import { HttpError } from '../../lib/http-error'
import { updateLastSelectedCampaign } from '../user'
import {
  createCampaign,
  isCampaignMember,
  listCampaignTemplates,
  listCampaignsForUser,
  updateCampaign,
} from './campaign.service'

export async function create(req: Request, res: Response): Promise<void> {
  // `req.body` is validated by `validate(createCampaignInputSchema)`; `req.user`
  // is guaranteed by `requireAuth` running before this handler.
  const input = req.body as CreateCampaignInput
  const result = await createCampaign({
    ...input,
    createdBy: req.user!.id,
  })
  res.status(201).json(result)
}

export function listTemplates(_req: Request, res: Response): void {
  res.status(200).json({ campaignTemplates: listCampaignTemplates() })
}

export async function list(req: Request, res: Response): Promise<void> {
  const campaigns = await listCampaignsForUser(req.user!.id)
  res.status(200).json({ campaigns })
}

export async function patch(req: Request, res: Response): Promise<void> {
  const { campaignId } = req.params as { campaignId: string }
  const input = req.body as UpdateCampaignInput
  const campaign = await updateCampaign(campaignId, input)
  if (!campaign) {
    throw new HttpError(404, 'not_found', 'Campaign not found.')
  }
  res.status(200).json({ campaign })
}

export async function selectCampaign(req: Request, res: Response): Promise<void> {
  const { campaignId } = req.body as SelectCampaignInput
  const userId = req.user!.id

  // Only remember campaigns the user can actually reach.
  const isMember = await isCampaignMember(userId, campaignId)
  if (!isMember) {
    throw HttpError.forbidden('Not a member of this campaign')
  }

  const user = await updateLastSelectedCampaign(userId, campaignId)
  if (!user) {
    throw HttpError.unauthorized()
  }
  res.status(200).json({ user })
}
