import type { Request, Response } from 'express'

import type {
  CampaignNpcStatusPatch,
  CharacterMediaPatchInput,
  CreateNpcRequestInput,
} from '@rpg/contracts'

import { HttpError } from '../../../lib/http-error'
import {
  createCampaignNpc,
  deleteCampaignNpc,
  getCampaignNpc,
  listCampaignNpcs,
  patchCampaignNpcMedia,
  patchCampaignNpcStatus,
} from './npc.service'

export async function list(req: Request, res: Response): Promise<void> {
  const { campaignId } = req.params as { campaignId: string }
  const npcs = await listCampaignNpcs(campaignId)
  res.status(200).json({ npcs })
}

export async function create(req: Request, res: Response): Promise<void> {
  const { campaignId } = req.params as { campaignId: string }
  const npc = await createCampaignNpc(campaignId, req.user!.id, req.body as CreateNpcRequestInput)
  res.status(201).json({ npc })
}

export async function getById(req: Request, res: Response): Promise<void> {
  const { campaignId, npcId } = req.params as { campaignId: string; npcId: string }
  const npc = await getCampaignNpc(campaignId, npcId)
  if (!npc) {
    throw new HttpError(404, 'not_found', 'NPC not found.')
  }
  res.status(200).json({ npc })
}

export async function remove(req: Request, res: Response): Promise<void> {
  const { campaignId, npcId } = req.params as { campaignId: string; npcId: string }
  const result = await deleteCampaignNpc(campaignId, npcId)
  if (result.status === 'not_found') {
    throw new HttpError(404, 'not_found', 'NPC not found.')
  }
  if (result.status === 'blocked') {
    res.status(409).json({ result })
    return
  }
  res.status(204).send()
}

export async function patchMedia(req: Request, res: Response): Promise<void> {
  const { campaignId, npcId } = req.params as { campaignId: string; npcId: string }
  const result = await patchCampaignNpcMedia(
    campaignId,
    npcId,
    req.body as CharacterMediaPatchInput,
  )
  if (result === null) {
    throw new HttpError(404, 'not_found', 'NPC not found.')
  }
  if (result === 'stale_revision') {
    throw new HttpError(409, 'conflict', 'NPC media was updated elsewhere. Reload and try again.')
  }
  if (result === 'validation_failed') {
    throw HttpError.badRequest('NPC media failed validation.')
  }
  if (result === 'asset_unavailable') {
    throw HttpError.badRequest('One or more media assets are unavailable.')
  }
  res.status(200).json({ npc: result })
}

export async function patch(req: Request, res: Response): Promise<void> {
  const { campaignId, npcId } = req.params as { campaignId: string; npcId: string }
  const npc = await patchCampaignNpcStatus(campaignId, npcId, req.body as CampaignNpcStatusPatch)
  if (!npc) {
    throw new HttpError(404, 'not_found', 'NPC not found.')
  }
  res.status(200).json({ npc })
}
