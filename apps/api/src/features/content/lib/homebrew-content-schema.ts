import type mongoose from 'mongoose'

import { SYSTEM_RULESET_IDS } from '@rpg/contracts'

/** Shared identity envelope for campaign-owned homebrew content documents. */
export const homebrewContentIdentityFields = {
  slug: { type: String, required: true, trim: true },
  rulesetId: { type: String, enum: [...SYSTEM_RULESET_IDS], required: true },
  campaignId: { type: String, required: true, index: true },
  status: { type: String, enum: ['draft', 'published'], default: 'published' },
  name: { type: String, required: true, trim: true },
  imageKey: { type: String },
  description: { type: String },
}

export function homebrewCampaignSlugIndex(schema: mongoose.Schema) {
  schema.index({ campaignId: 1, rulesetId: 1, slug: 1 }, { unique: true })
}
