import type { Request, Response } from 'express'

import type { CampaignNpcStatusPatch, CreateNpcRequestInput } from '@rpg/contracts'

import { HttpError } from '../../../lib/http-error'
import {
  createCampaignNpc,
  deleteCampaignNpc,
  getCampaignNpc,
  listCampaignNpcs,
  patchCampaignNpcStatus,
} from './npc.service'

export async function list(req: Request, res: Response): Promise<void> {
  const { campaignId } = req.params as { campaignId: string }
  const npcs = await listCampaignNpcs(campaignId)
  res.status(200).json({ npcs })
}

export async function create(req: Request, res: Response): Promise<void> {
  const { campaignId } = req.params as { campaignId: string }
  const npc = await createCampaignNpc(campaignId, req.body as CreateNpcRequestInput)
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
  const deleted = await deleteCampaignNpc(campaignId, npcId)
  if (!deleted) {
    throw new HttpError(404, 'not_found', 'NPC not found.')
  }
  res.status(204).send()
}

export async function patch(req: Request, res: Response): Promise<void> {
  const { campaignId, npcId } = req.params as { campaignId: string; npcId: string }
  const npc = await patchCampaignNpcStatus(campaignId, npcId, req.body as CampaignNpcStatusPatch)
  if (!npc) {
    throw new HttpError(404, 'not_found', 'NPC not found.')
  }
  res.status(200).json({ npc })
}
