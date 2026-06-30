import type { Request, Response } from 'express'

import { loadSubclassesByClassId } from '@rpg/catalog/classes'

import { HttpError } from '../../lib/http-error'
import { findCampaignById } from '../campaign'
import {
  getContentWriteConfig,
  isContentWriteType,
  resolveContentForCampaign,
} from './content-types'
import { createHomebrewContent, updateContentEntity } from './lib/content-write.service'
import { getHomebrewContentSummary } from './lib/homebrew-summary.service'

export async function createContentItem(req: Request, res: Response): Promise<void> {
  const { campaignId, contentType } = req.params as { campaignId: string; contentType: string }
  if (!isContentWriteType(contentType)) {
    throw new HttpError(404, 'not_found', `Unknown content type "${contentType}".`)
  }
  const writeConfig = getContentWriteConfig(contentType)!
  const entity = await createHomebrewContent(writeConfig, campaignId, req.body)
  res.status(201).json({ [writeConfig.responseKey]: entity })
}

export async function updateContentItem(req: Request, res: Response): Promise<void> {
  const { campaignId, contentType, entityId } = req.params as {
    campaignId: string
    contentType: string
    entityId: string
  }
  if (!isContentWriteType(contentType)) {
    throw new HttpError(404, 'not_found', `Unknown content type "${contentType}".`)
  }
  const writeConfig = getContentWriteConfig(contentType)!
  const entity = await updateContentEntity(writeConfig, campaignId, entityId, req.body)
  res.status(200).json({ [writeConfig.responseKey]: entity })
}

export async function listClasses(req: Request, res: Response): Promise<void> {
  const { campaignId } = req.params as { campaignId: string }
  const classes = await resolveContentForCampaign('classes', campaignId)
  res.status(200).json({ classes })
}

export async function listSubclasses(req: Request, res: Response): Promise<void> {
  const { campaignId, classId } = req.params as { campaignId: string; classId: string }
  const campaign = await findCampaignById(campaignId)
  if (!campaign) {
    throw new HttpError(404, 'not_found', 'Campaign not found.')
  }
  const subclasses = loadSubclassesByClassId(campaign.rulesetId, classId)
  res.status(200).json({ subclasses })
}

export async function listSkillProficiencies(req: Request, res: Response): Promise<void> {
  const { campaignId } = req.params as { campaignId: string }
  const skillProficiencies = await resolveContentForCampaign('skill-proficiencies', campaignId)
  res.status(200).json({ skillProficiencies })
}

export async function listEquipment(req: Request, res: Response): Promise<void> {
  const { campaignId } = req.params as { campaignId: string }
  const equipment = await resolveContentForCampaign('equipment', campaignId)
  res.status(200).json({ equipment })
}

export async function listSpecies(req: Request, res: Response): Promise<void> {
  const { campaignId } = req.params as { campaignId: string }
  const species = await resolveContentForCampaign('species', campaignId)
  res.status(200).json({ species })
}

export async function listSpells(req: Request, res: Response): Promise<void> {
  const { campaignId } = req.params as { campaignId: string }
  const spells = await resolveContentForCampaign('spells', campaignId)
  res.status(200).json({ spells })
}

export async function listFeats(req: Request, res: Response): Promise<void> {
  const { campaignId } = req.params as { campaignId: string }
  const feats = await resolveContentForCampaign('feats', campaignId)
  res.status(200).json({ feats })
}

export async function listStartingWealth(req: Request, res: Response): Promise<void> {
  const { campaignId } = req.params as { campaignId: string }
  const startingWealth = await resolveContentForCampaign('starting-wealth', campaignId)
  res.status(200).json({ startingWealth })
}

export async function getHomebrewSummary(req: Request, res: Response): Promise<void> {
  const { campaignId } = req.params as { campaignId: string }
  const summary = await getHomebrewContentSummary(campaignId)
  res.status(200).json({ summary })
}
