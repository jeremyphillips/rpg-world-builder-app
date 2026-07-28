import { isValidObjectId } from 'mongoose'
import type {
  Campaign,
  CampaignListItem,
  CampaignRole,
  CampaignTemplate,
  CreateCampaignInput,
  CreateCampaignResult,
  UpdateCampaignInput,
} from '@rpg/contracts'
import { loadCampaignTemplates } from '@rpg/catalog/presets'

import { CampaignModel, type CampaignSchemaType } from './campaign.model'
import { CampaignMembershipModel } from './campaign-membership.model'
import { persistCreatedCampaign } from './create-campaign-persistence.lib'
import {
  sendInitialCampaignInvites,
  assertValidInitialCampaignInviteRecipients,
} from './create-campaign-invites.lib'
import { findCampaignById, toCampaign } from './find-campaign-by-id'

type CampaignRecord = CampaignSchemaType & {
  _id: unknown
  createdAt: Date
  updatedAt: Date
}

export async function createCampaign(
  input: CreateCampaignInput & { createdBy: string },
): Promise<CreateCampaignResult> {
  const { createdBy, inviteEmails, ...createInput } = input

  if (inviteEmails && inviteEmails.length > 0) {
    await assertValidInitialCampaignInviteRecipients({ invitedByUserId: createdBy, inviteEmails })
  }

  const campaign = await persistCreatedCampaign(createInput, createdBy)
  const invites = await sendInitialCampaignInvites({
    campaignId: campaign.id,
    invitedByUserId: createdBy,
    inviteEmails: inviteEmails ?? [],
  })

  return { campaign, invites }
}

/** Shipped campaign templates available to the creation experience. */
export function listCampaignTemplates(): CampaignTemplate[] {
  return loadCampaignTemplates()
}

/**
 * List every campaign the user can reach via membership. Because the creator is
 * given an `owner` membership on create, this covers both campaigns they own and
 * campaigns they merely belong to. Sorted by name for a stable switcher order.
 */
export async function listCampaignsForUser(userId: string): Promise<CampaignListItem[]> {
  const memberships = await CampaignMembershipModel.find({ userId })
    .select('campaignId campaignRole controlledCharacterIds')
    .lean<{ campaignId: string; campaignRole: string; controlledCharacterIds?: string[] }[]>()

  const membershipByCampaignId = new Map(
    memberships.map((membership) => [membership.campaignId, membership]),
  )

  const campaignIds = memberships.map((m) => m.campaignId).filter((id) => isValidObjectId(id))
  if (campaignIds.length === 0) return []

  const docs = await CampaignModel.find({ _id: { $in: campaignIds } }).lean<CampaignRecord[]>()
  return docs
    .map((doc) => {
      const campaign = toCampaign(doc)
      const membership = membershipByCampaignId.get(campaign.id)
      return {
        ...campaign,
        campaignRole: membership?.campaignRole as CampaignRole,
        controlledCharacterIds: membership?.controlledCharacterIds ?? [],
      }
    })
    .sort((a, b) => a.identity.name.localeCompare(b.identity.name))
}

function buildIdentityUpdateSet(input: UpdateCampaignInput): Record<string, unknown> {
  const $set: Record<string, unknown> = {}
  if (input.name !== undefined) $set['identity.name'] = input.name
  if (input.description !== undefined) $set['identity.description'] = input.description
  if (input.imageKey !== undefined) $set['identity.imageKey'] = input.imageKey
  return $set
}

const FLAVOR_PATHS = {
  playStyle: 'configuration.flavor.playStyle',
  mood: 'configuration.flavor.mood',
  magicLevel: 'configuration.flavor.magicLevel',
  difficulty: 'configuration.flavor.difficulty',
} as const satisfies Record<keyof NonNullable<UpdateCampaignInput['flavor']>, string>

function buildFlavorUpdateSet(
  flavor: NonNullable<UpdateCampaignInput['flavor']>,
): Record<string, unknown> {
  const $set: Record<string, unknown> = {}
  for (const key of Object.keys(FLAVOR_PATHS) as Array<keyof typeof FLAVOR_PATHS>) {
    if (flavor[key] !== undefined) $set[FLAVOR_PATHS[key]] = flavor[key]
  }
  return $set
}

function buildCampaignUpdateSet(input: UpdateCampaignInput): Record<string, unknown> {
  return {
    ...buildIdentityUpdateSet(input),
    ...(input.flavor ? buildFlavorUpdateSet(input.flavor) : {}),
  }
}

/** Merge a partial update into an existing campaign document. Returns null when the id is invalid or missing. */
export async function updateCampaign(
  campaignId: string,
  input: UpdateCampaignInput,
): Promise<Campaign | null> {
  if (!isValidObjectId(campaignId)) return null

  const $set = buildCampaignUpdateSet(input)
  if (Object.keys($set).length === 0) {
    return findCampaignById(campaignId)
  }

  const doc = await CampaignModel.findByIdAndUpdate(
    campaignId,
    { $set },
    { returnDocument: 'after' },
  ).lean<CampaignRecord | null>()
  if (!doc) return null
  return toCampaign(doc)
}

/** Whether the user has any membership in the given campaign. */
export async function isCampaignMember(userId: string, campaignId: string): Promise<boolean> {
  if (!isValidObjectId(campaignId)) return false
  const membership = await CampaignMembershipModel.findOne({ campaignId, userId })
    .select('_id')
    .lean()
  return membership !== null
}
