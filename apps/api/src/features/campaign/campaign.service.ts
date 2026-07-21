import { isValidObjectId } from 'mongoose'
import type {
  Campaign,
  CampaignListItem,
  CampaignRole,
  CampaignTemplate,
  CreateCampaignInput,
  UpdateCampaignInput,
} from '@rpg/contracts'
import { loadCampaignTemplates, resolveCampaignCreationPreset } from '@rpg/catalog/presets'

import { HttpError } from '../../lib/http-error'
import { writeInitialCharacterCreation, writeInitialMechanics } from '../vocabulary'
import { CampaignModel, type CampaignSchemaType } from './campaign.model'
import { CampaignMembershipModel } from './campaign-membership.model'
import { findCampaignById, toCampaign } from './find-campaign-by-id'

type CampaignRecord = CampaignSchemaType & {
  _id: unknown
  createdAt: Date
  updatedAt: Date
}

export async function createCampaign(
  input: CreateCampaignInput & { createdBy: string },
): Promise<Campaign> {
  const { createdBy, ...createInput } = input
  const presetResolution = resolveCampaignCreationPreset(createInput)
  if (!presetResolution.ok) {
    const message =
      presetResolution.reason === 'template_not_found'
        ? `Campaign template not found: ${presetResolution.campaignTemplateId}`
        : `Campaign template ruleset does not match the requested ruleset: ${presetResolution.campaignTemplateId}`
    throw HttpError.badRequest(message)
  }

  // WorldSeedPack is descriptor-only. Fail closed if a pack is linked before
  // the typed world-content materializer is implemented.
  if (presetResolution.worldSeedPacks.length > 0) {
    throw HttpError.badRequest('World seed pack materialization is not available yet.')
  }

  const materializedInput = presetResolution.input
  const doc = await CampaignModel.create({
    identity: {
      name: materializedInput.name,
      ...(materializedInput.description !== undefined && {
        description: materializedInput.description,
      }),
      ...(materializedInput.imageKey !== undefined && { imageKey: materializedInput.imageKey }),
    },
    configuration: {
      ...(materializedInput.flavor !== undefined && { flavor: materializedInput.flavor }),
    },
    // Omit when undefined so the model default (DEFAULT_SYSTEM_RULESET_ID) applies.
    ...(materializedInput.rulesetId !== undefined && { rulesetId: materializedInput.rulesetId }),
    ...(presetResolution.template && {
      presetProvenance: {
        campaignTemplate: {
          id: presetResolution.template.metadata.id,
          version: presetResolution.template.metadata.version,
        },
        worldSeedPacks: presetResolution.worldSeedPacks.map((pack) => ({
          id: pack.metadata.id,
          version: pack.metadata.version,
        })),
      },
    }),
    createdBy,
  })

  const campaignId = String(doc._id)
  const rulesetId = doc.rulesetId

  // Access control is membership-based, so the creator's owner membership must
  // exist for the campaign to be reachable. No replica set is guaranteed in
  // local dev (so no transaction); compensate by deleting the orphan on failure.
  try {
    await CampaignMembershipModel.create({
      campaignId,
      userId: createdBy,
      campaignRole: 'owner',
      characterIds: [],
      invitedAt: new Date(),
      joinedAt: new Date(),
    })

    if (materializedInput.characterCreation) {
      await writeInitialCharacterCreation(
        campaignId,
        rulesetId,
        materializedInput.characterCreation,
      )
    }

    await writeInitialMechanics(campaignId, rulesetId)
  } catch (err) {
    await CampaignModel.deleteOne({ _id: doc._id })
    throw err
  }

  return toCampaign(doc.toObject() as CampaignRecord)
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
    { new: true },
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
