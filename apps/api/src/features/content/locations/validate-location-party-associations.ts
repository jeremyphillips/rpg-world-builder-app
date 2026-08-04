import type { LocationPartyAssociation } from '@rpg/contracts'

import { listOpenParticipationsForCampaign } from '../../campaign/participation/campaign-character-participation.repository'
import { HttpError } from '../../../lib/http-error'
import type { ContentWriteContext } from '../lib/content-write-config'
import { HomebrewOrganizationModel } from '../organizations/homebrew-organization.model'
import {
  extractCharacterPartyIdsFromLocation,
  extractOrganizationPartyIdsFromLocation,
} from './location-party-reference.lib'

function entityBody(entity: Record<string, unknown>): Record<string, unknown> {
  const {
    id: _id,
    slug: _slug,
    rulesetId: _rulesetId,
    source: _source,
    status: _status,
    campaignId: _campaignId,
    createdAt: _createdAt,
    updatedAt: _updatedAt,
    ...body
  } = entity
  return body
}

function mergedPartyAssociations(ctx: ContentWriteContext): LocationPartyAssociation[] {
  const existingBody = ctx.existing
    ? entityBody(ctx.existing as unknown as Record<string, unknown>)
    : {}
  const merged = { ...existingBody, ...ctx.input }
  const associations = merged.partyAssociations
  return Array.isArray(associations) ? (associations as LocationPartyAssociation[]) : []
}

/** Validates party refs resolve to campaign-accessible characters and organizations. */
export async function validateLocationPartyAssociations(ctx: ContentWriteContext): Promise<void> {
  const associations = mergedPartyAssociations(ctx)
  if (associations.length === 0) return

  const characterIds = [
    ...new Set(extractCharacterPartyIdsFromLocation({ partyAssociations: associations })),
  ]
  const organizationIds = [
    ...new Set(extractOrganizationPartyIdsFromLocation({ partyAssociations: associations })),
  ]

  if (characterIds.length > 0) {
    const participations = await listOpenParticipationsForCampaign(ctx.campaignId)
    const participatingCharacterIds = new Set(participations.map((entry) => entry.characterId))

    for (const characterId of characterIds) {
      if (!participatingCharacterIds.has(characterId)) {
        throw new HttpError(
          400,
          'invalid_reference',
          `Character "${characterId}" was not found in this campaign.`,
        )
      }
    }
  }

  if (organizationIds.length > 0) {
    const docs = await HomebrewOrganizationModel.find({
      _id: { $in: organizationIds },
      campaignId: ctx.campaignId,
    })
      .select('_id')
      .lean<Array<{ _id: unknown }>>()

    const foundIds = new Set(docs.map((doc) => String(doc._id)))
    for (const organizationId of organizationIds) {
      if (!foundIds.has(organizationId)) {
        throw new HttpError(
          400,
          'invalid_reference',
          `Organization "${organizationId}" was not found in this campaign.`,
        )
      }
    }
  }
}
