import type { Request, Response } from 'express'

import { getContentTypeConfig } from './content-types'
import { resolveCatalogForCampaign } from './content.service'
import { loadSubclassesByClassId } from './classes/seed'
import { findCampaignById } from '../campaign'
import { HttpError } from '../../lib/http-error'

export async function listClasses(req: Request, res: Response): Promise<void> {
  // `campaignId` is validated by `requireCampaignRole` (membership) upstream.
  const { campaignId } = req.params as { campaignId: string }
  const config = getContentTypeConfig('classes')
  const classes = await resolveCatalogForCampaign(config, campaignId)
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
  const config = getContentTypeConfig('skill-proficiencies')
  const skillProficiencies = await resolveCatalogForCampaign(config, campaignId)
  res.status(200).json({ skillProficiencies })
}

export async function listEquipment(req: Request, res: Response): Promise<void> {
  const { campaignId } = req.params as { campaignId: string }
  const config = getContentTypeConfig('equipment')
  const equipment = await resolveCatalogForCampaign(config, campaignId)
  res.status(200).json({ equipment })
}

export async function listWeapons(req: Request, res: Response): Promise<void> {
  const { campaignId } = req.params as { campaignId: string }
  const config = getContentTypeConfig('weapons')
  const weapons = await resolveCatalogForCampaign(config, campaignId)
  res.status(200).json({ weapons })
}

export async function listArmor(req: Request, res: Response): Promise<void> {
  const { campaignId } = req.params as { campaignId: string }
  const config = getContentTypeConfig('armor')
  const armor = await resolveCatalogForCampaign(config, campaignId)
  res.status(200).json({ armor })
}

export async function listSpecies(req: Request, res: Response): Promise<void> {
  const { campaignId } = req.params as { campaignId: string }
  const config = getContentTypeConfig('species')
  const species = await resolveCatalogForCampaign(config, campaignId)
  res.status(200).json({ species })
}
