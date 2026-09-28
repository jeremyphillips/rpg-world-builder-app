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
import {
  filterViewerOpenParticipatingCharacterIds,
  resolveCampaignViewerState,
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
import { validateCampaignPrimaryWorldId } from './validate-campaign-primary-world'
import { listCharactersForUser } from '../character'
import {
  countOpenPartyPcsByCampaignIds,
  listOpenPcParticipationCharacterIdsForCampaign,
  resolveOpenControlledPcCharacterIds,
} from './participation/campaign-character-participation.repository'

type CampaignRecord = CampaignSchemaType & {
  _id: unknown
  createdAt: Date
  updatedAt: Date
}

function dedupeCharacterIds(ids: readonly string[]): string[] {
  return [...new Set(ids)]
}

type MembershipListRecord = {
  campaignId: string
  campaignRole: string
  controlledCharacterIds?: string[]
  lastOpenedAt?: Date | null
}

async function countPlayerMembersByCampaignIds(
  campaignIds: readonly string[],
): Promise<Map<string, number>> {
  if (campaignIds.length === 0) return new Map()

  const rows = await CampaignMembershipModel.aggregate<{ _id: string; count: number }>([
    { $match: { campaignId: { $in: [...campaignIds] }, campaignRole: 'pc' } },
    { $group: { _id: '$campaignId', count: { $sum: 1 } } },
  ])

  return new Map(rows.map((row) => [row._id, row.count]))
}

function membershipLastOpenedIso(membership: MembershipListRecord | undefined): string | null {
  const value = membership?.lastOpenedAt
  if (!value) return null
  return value.toISOString()
}

/** Record that the viewer opened the campaign shell (membership-scoped recency). */
export async function touchCampaignOpened(userId: string, campaignId: string): Promise<boolean> {
  if (!isValidObjectId(campaignId)) return false

  const result = await CampaignMembershipModel.updateOne(
    { campaignId, userId },
    { $set: { lastOpenedAt: new Date() } },
  )

  return result.matchedCount === 1
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
    .select('campaignId campaignRole controlledCharacterIds lastOpenedAt')
    .lean<MembershipListRecord[]>()

  const membershipByCampaignId = new Map(
    memberships.map((membership) => [membership.campaignId, membership]),
  )

  const campaignIds = memberships.map((m) => m.campaignId).filter((id) => isValidObjectId(id))
  if (campaignIds.length === 0) return []

  const [docs, playerMemberCountByCampaignId, openPcCountByCampaignId] = await Promise.all([
    CampaignModel.find({ _id: { $in: campaignIds } }).lean<CampaignRecord[]>(),
    countPlayerMembersByCampaignIds(campaignIds),
    countOpenPartyPcsByCampaignIds(campaignIds),
  ])
  const userCharacters = await listCharactersForUser(userId)
  const userCharacterIds = userCharacters.map((character) => character.id)

  const campaigns = await Promise.all(
    docs.map(async (doc) => {
      const campaign = toCampaign(doc)
      const membership = membershipByCampaignId.get(campaign.id)
      const controlledCharacterIds = membership?.controlledCharacterIds ?? []
      const campaignWideOpenParticipatingCharacterIds =
        await listOpenPcParticipationCharacterIdsForCampaign(campaign.id)
      const openParticipatingCharacterIds = filterViewerOpenParticipatingCharacterIds({
        controlledCharacterIds,
        openParticipatingCharacterIds: campaignWideOpenParticipatingCharacterIds,
        userCharacterIds,
      })
      const openControlledCharacterIds = dedupeCharacterIds(
        await resolveOpenControlledPcCharacterIds(campaign.id, controlledCharacterIds),
      )
      const campaignRole = membership?.campaignRole as CampaignRole
      const { viewerState, recoveryReason } = resolveCampaignViewerState({
        role: campaignRole,
        controlledCharacterIds,
        openParticipatingCharacterIds,
      })
      return {
        ...campaign,
        campaignRole,
        controlledCharacterIds,
        openControlledCharacterIds,
        viewerState,
        recoveryReason,
        playerMemberCount: playerMemberCountByCampaignId.get(campaign.id) ?? 0,
        openPcCount: openPcCountByCampaignId.get(campaign.id) ?? 0,
        lastOpenedByViewerAt: membershipLastOpenedIso(membership),
      }
    }),
  )
  return campaigns.sort((a, b) => a.identity.name.localeCompare(b.identity.name))
}

function buildIdentityUpdateSet(input: UpdateCampaignInput): Record<string, unknown> {
  const $set: Record<string, unknown> = {}
  if (input.name !== undefined) $set['identity.name'] = input.name
  if (input.description !== undefined) $set['identity.description'] = input.description
  if (input.media !== undefined) $set['identity.media'] = input.media
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

type CampaignMongoUpdate = {
  $set: Record<string, unknown>
  $unset: Record<string, 1>
}

function buildCampaignMongoUpdate(input: UpdateCampaignInput): CampaignMongoUpdate {
  const $set: Record<string, unknown> = {
    ...buildIdentityUpdateSet(input),
    ...(input.flavor ? buildFlavorUpdateSet(input.flavor) : {}),
  }
  const $unset: Record<string, 1> = {}

  if (input.settings) {
    if (input.settings.primaryWorldId === null) {
      $unset['configuration.settings.primaryWorldId'] = 1
    } else if (input.settings.primaryWorldId !== undefined) {
      $set['configuration.settings.primaryWorldId'] = input.settings.primaryWorldId
    }
  }

  return { $set, $unset }
}

/** Merge a partial update into an existing campaign document. Returns null when the id is invalid or missing. */
export async function updateCampaign(
  campaignId: string,
  input: UpdateCampaignInput,
): Promise<Campaign | null> {
  if (!isValidObjectId(campaignId)) return null

  if (input.settings?.primaryWorldId) {
    await validateCampaignPrimaryWorldId(campaignId, input.settings.primaryWorldId)
  }

  const { $set, $unset } = buildCampaignMongoUpdate(input)
  const hasSet = Object.keys($set).length > 0
  const hasUnset = Object.keys($unset).length > 0

  if (!hasSet && !hasUnset) {
    return findCampaignById(campaignId)
  }

  const mongoUpdate: Record<string, unknown> = {}
  if (hasSet) mongoUpdate.$set = $set
  if (hasUnset) mongoUpdate.$unset = $unset

  const doc = await CampaignModel.findByIdAndUpdate(campaignId, mongoUpdate, {
    returnDocument: 'after',
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
