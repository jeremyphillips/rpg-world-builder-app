import { isValidObjectId } from 'mongoose'
import type {
  Campaign,
  CampaignConfiguration,
  CampaignIdentity,
  CampaignStatus,
  CampaignVisibility,
  CreateCampaignInput,
} from '@rpg/contracts'

import { CampaignModel, type CampaignSchemaType } from './campaign.model'
import { CampaignMembershipModel } from './campaign-membership.model'

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

export async function createCampaign(
  input: CreateCampaignInput & { createdBy: string },
): Promise<Campaign> {
  const doc = await CampaignModel.create({
    identity: { name: input.name },
    configuration: {},
    createdBy: input.createdBy,
  })

  // Access control is membership-based, so the creator's owner membership must
  // exist for the campaign to be reachable. No replica set is guaranteed in
  // local dev (so no transaction); compensate by deleting the orphan on failure.
  try {
    await CampaignMembershipModel.create({
      campaignId: String(doc._id),
      userId: input.createdBy,
      campaignRole: 'owner',
      characterIds: [],
      invitedAt: new Date(),
      joinedAt: new Date(),
    })
  } catch (err) {
    await CampaignModel.deleteOne({ _id: doc._id })
    throw err
  }

  return toCampaign(doc.toObject() as CampaignRecord)
}

export async function findCampaignById(id: string): Promise<Campaign | null> {
  if (!isValidObjectId(id)) return null
  const doc = await CampaignModel.findById(id).lean<CampaignRecord | null>()
  if (!doc) return null
  return toCampaign(doc)
}
