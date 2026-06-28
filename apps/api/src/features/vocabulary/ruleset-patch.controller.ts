import type { Request, Response } from 'express'

import { updateCampaignCharacterCreationInputSchema } from '@rpg/contracts'
import type { UpdateCampaignCharacterCreationInput } from '@rpg/contracts'

import { HttpError } from '../../lib/http-error'
import { getRulesetPatchRead, updateCharacterCreationPatch } from './ruleset-patch.service'

export async function getRulesetPatch(req: Request, res: Response): Promise<void> {
  const { campaignId } = req.params as { campaignId: string }
  const patch = await getRulesetPatchRead(campaignId)
  if (!patch) {
    throw new HttpError(404, 'not_found', 'Campaign not found.')
  }
  res.status(200).json({ patch })
}

export async function patchCharacterCreation(req: Request, res: Response): Promise<void> {
  const { campaignId } = req.params as { campaignId: string }
  const parsed = updateCampaignCharacterCreationInputSchema.safeParse(
    req.body as UpdateCampaignCharacterCreationInput,
  )
  if (!parsed.success) {
    throw HttpError.badRequest('Invalid character creation patch.', parsed.error.flatten())
  }

  const patch = await updateCharacterCreationPatch(campaignId, parsed.data)
  if (!patch) {
    throw new HttpError(404, 'not_found', 'Campaign not found.')
  }
  res.status(200).json({ patch })
}
