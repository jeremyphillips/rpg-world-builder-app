import { isValidObjectId } from 'mongoose'

import { DEFAULT_SYSTEM_RULESET_ID } from '@rpg/contracts'
import type {
  Campaign,
  CampaignConfiguration,
  CampaignIdentity,
  CampaignPresetProvenance,
  CampaignStatus,
  CampaignVisibility,
  SystemRulesetId,
} from '@rpg/contracts'

import { CampaignModel, type CampaignSchemaType } from './campaign.model'

type CampaignRecord = CampaignSchemaType & {
  _id: unknown
  createdAt: Date
  updatedAt: Date
}

/** Maps a lean campaign document to the API `Campaign` DTO. */
export function toCampaign(doc: CampaignRecord): Campaign {
  return {
    id: String(doc._id),
    identity: doc.identity as CampaignIdentity,
    configuration: (doc.configuration ?? {}) as CampaignConfiguration,
    status: doc.status as CampaignStatus,
    visibility: doc.visibility as CampaignVisibility,
    rulesetId: (doc.rulesetId ?? DEFAULT_SYSTEM_RULESET_ID) as SystemRulesetId,
    ...(doc.presetProvenance && {
      presetProvenance: doc.presetProvenance as CampaignPresetProvenance,
    }),
    createdBy: doc.createdBy,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  }
}

/** Loads a campaign by Mongo id — leaf helper to avoid campaign ↔ vocabulary import cycles. */
export async function findCampaignById(id: string): Promise<Campaign | null> {
  if (!isValidObjectId(id)) return null
  const doc = await CampaignModel.findById(id).lean<CampaignRecord | null>()
  if (!doc) return null
  return toCampaign(doc)
}
