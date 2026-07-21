import { campaignTemplateSchema, type CampaignTemplate } from '@rpg/contracts'
import { z } from 'zod'

import templatesRaw from './data/campaign-templates.json'

const CAMPAIGN_TEMPLATES = z.array(campaignTemplateSchema).parse(templatesRaw)

/** Shipped, ruleset-aware campaign creation templates. */
export function loadCampaignTemplates(): CampaignTemplate[] {
  return CAMPAIGN_TEMPLATES
}

export function getCampaignTemplateById(id: string): CampaignTemplate {
  const template = findCampaignTemplateById(id)

  if (!template) {
    throw new Error(`Campaign template not found: ${id}`)
  }

  return template
}

export function findCampaignTemplateById(id: string): CampaignTemplate | undefined {
  return CAMPAIGN_TEMPLATES.find((entry) => entry.metadata.id === id)
}
