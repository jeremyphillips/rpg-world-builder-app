import { isValidObjectId } from 'mongoose'
import type {
  Campaign,
  CampaignConfiguration,
  CampaignIdentity,
  CampaignStatus,
  CampaignVisibility,
} from '@rpg/contracts'

import { CampaignModel, type CampaignSchemaType } from './campaign.model'

type CampaignRecord = CampaignSchemaType & {
  _id: unknown
  createdAt: Date
  updatedAt: Date
}

function toCampaign(doc: CampaignRecord): Campaign {
  return {
    id: String(doc._id),
    identity: doc.identity as CampaignIdentity,
    configuration: (doc.configuration ?? {}) as CampaignConfiguration,
    status: doc.status as CampaignStatus,
    visibility: doc.visibility as CampaignVisibility,
    createdBy: doc.createdBy,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  }
}

export interface CreateCampaignInput {
  name: string
  createdBy: string
}

export async function createCampaign(input: CreateCampaignInput): Promise<Campaign> {
  const doc = await CampaignModel.create({
    identity: { name: input.name },
    configuration: {},
    createdBy: input.createdBy,
  })
  return toCampaign(doc.toObject() as CampaignRecord)
}

export async function findCampaignById(id: string): Promise<Campaign | null> {
  if (!isValidObjectId(id)) return null
  const doc = await CampaignModel.findById(id).lean<CampaignRecord | null>()
  if (!doc) return null
  return toCampaign(doc)
}
