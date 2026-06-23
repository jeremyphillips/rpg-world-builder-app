import { isValidObjectId } from 'mongoose'
import { DEFAULT_SYSTEM_RULESET_ID, MAX_CHARACTER_LEVEL } from '@rpg/contracts'
import type {
  Campaign,
  CampaignConfiguration,
  CampaignIdentity,
  CampaignListItem,
  CampaignRole,
  CampaignStatus,
  CampaignVisibility,
  CreateCampaignInput,
  SystemRulesetId,
  UpdateCampaignInput,
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
    rulesetId: (doc.rulesetId ?? DEFAULT_SYSTEM_RULESET_ID) as SystemRulesetId,
    createdBy: doc.createdBy,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  }
}

const DEFAULT_SETTINGS = {
  characterCreation: {
    startingLevel: 1,
    importedCharacters: { policy: 'disabled' as const },
  },
}

export async function createCampaign(
  input: CreateCampaignInput & { createdBy: string },
): Promise<Campaign> {
  const doc = await CampaignModel.create({
    identity: {
      name: input.name,
      ...(input.description !== undefined && { description: input.description }),
      ...(input.imageKey !== undefined && { imageKey: input.imageKey }),
    },
    configuration: {
      settings: input.settings ?? DEFAULT_SETTINGS,
      ...(input.flavor !== undefined && { flavor: input.flavor }),
    },
    // Omit when undefined so the model default (DEFAULT_SYSTEM_RULESET_ID) applies.
    ...(input.rulesetId !== undefined && { rulesetId: input.rulesetId }),
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

/**
 * List every campaign the user can reach via membership. Because the creator is
 * given an `owner` membership on create, this covers both campaigns they own and
 * campaigns they merely belong to. Sorted by name for a stable switcher order.
 */
export async function listCampaignsForUser(userId: string): Promise<CampaignListItem[]> {
  const memberships = await CampaignMembershipModel.find({ userId })
    .select('campaignId campaignRole')
    .lean<{ campaignId: string; campaignRole: string }[]>()

  const roleByCampaignId = new Map(
    memberships.map((membership) => [membership.campaignId, membership.campaignRole]),
  )

  const campaignIds = memberships.map((m) => m.campaignId).filter((id) => isValidObjectId(id))
  if (campaignIds.length === 0) return []

  const docs = await CampaignModel.find({ _id: { $in: campaignIds } }).lean<CampaignRecord[]>()
  return docs
    .map((doc) => {
      const campaign = toCampaign(doc)
      return {
        ...campaign,
        campaignRole: roleByCampaignId.get(campaign.id) as CampaignRole,
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

function buildSettingsUpdateSet(settings: NonNullable<UpdateCampaignInput['settings']>): {
  $set: Record<string, unknown>
  $unset: Record<string, 1>
} {
  const $set: Record<string, unknown> = {
    'configuration.settings.characterCreation.startingLevel':
      settings.characterCreation.startingLevel,
    'configuration.settings.characterCreation.importedCharacters.policy':
      settings.characterCreation.importedCharacters.policy,
  }
  const $unset: Record<string, 1> = {}

  const maxCharacterLevel = settings.ruleOverrides?.maxCharacterLevel
  if (maxCharacterLevel !== undefined && maxCharacterLevel !== MAX_CHARACTER_LEVEL) {
    $set['configuration.settings.ruleOverrides.maxCharacterLevel'] = maxCharacterLevel
  } else {
    $unset['configuration.settings.ruleOverrides.maxCharacterLevel'] = 1
  }

  return { $set, $unset }
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

function buildCampaignUpdateSet(input: UpdateCampaignInput): {
  $set: Record<string, unknown>
  $unset: Record<string, 1>
} {
  const settingsPatch = input.settings ? buildSettingsUpdateSet(input.settings) : null
  return {
    $set: {
      ...buildIdentityUpdateSet(input),
      ...(settingsPatch?.$set ?? {}),
      ...(input.flavor ? buildFlavorUpdateSet(input.flavor) : {}),
    },
    $unset: settingsPatch?.$unset ?? {},
  }
}

/** Merge a partial update into an existing campaign document. Returns null when the id is invalid or missing. */
export async function updateCampaign(
  campaignId: string,
  input: UpdateCampaignInput,
): Promise<Campaign | null> {
  if (!isValidObjectId(campaignId)) return null

  const { $set, $unset } = buildCampaignUpdateSet(input)
  if (Object.keys($set).length === 0 && Object.keys($unset).length === 0) {
    return findCampaignById(campaignId)
  }

  const update: { $set?: Record<string, unknown>; $unset?: Record<string, 1> } = {}
  if (Object.keys($set).length > 0) update.$set = $set
  if (Object.keys($unset).length > 0) update.$unset = $unset

  const doc = await CampaignModel.findByIdAndUpdate(campaignId, update, {
    new: true,
  }).lean<CampaignRecord | null>()
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
