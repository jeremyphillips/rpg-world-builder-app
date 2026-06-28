import type { Request, Response } from 'express'

import {
  updateCampaignCharacterCreationInputSchema,
  updateCampaignMechanicsInputSchema,
} from '@rpg/contracts'
import type {
  UpdateCampaignCharacterCreationInput,
  UpdateCampaignMechanicsInput,
} from '@rpg/contracts'

import { HttpError } from '../../lib/http-error'
import {
  getRulesetPatchRead,
  updateCharacterCreationPatch,
  updateMechanicsPatch,
} from './ruleset-patch.service'

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

export async function patchMechanics(req: Request, res: Response): Promise<void> {
  const { campaignId } = req.params as { campaignId: string }
  const parsed = updateCampaignMechanicsInputSchema.safeParse(
    req.body as UpdateCampaignMechanicsInput,
  )
  if (!parsed.success) {
    throw HttpError.badRequest('Invalid mechanics patch.', parsed.error.flatten())
  }

  const patch = await updateMechanicsPatch(campaignId, parsed.data)
  if (!patch) {
    throw new HttpError(404, 'not_found', 'Campaign not found.')
  }
  res.status(200).json({ patch })
}
