import type { TerritorialAuthorityRelationship } from '@rpg/contracts'

import { HttpError } from '../../../lib/http-error'
import type { ContentWriteContext } from '../lib/content-write-config'
import { HomebrewOrganizationModel } from '../organizations/homebrew-organization.model'
import { extractOrganizationIdsFromTerritorialAuthority } from './location-territorial-authority-reference.lib'

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

function mergedTerritorialAuthority(ctx: ContentWriteContext): TerritorialAuthorityRelationship[] {
  const existingBody = ctx.existing
    ? entityBody(ctx.existing as unknown as Record<string, unknown>)
    : {}
  const merged = { ...existingBody, ...ctx.input }
  const relationships = merged.territorialAuthority
  return Array.isArray(relationships) ? (relationships as TerritorialAuthorityRelationship[]) : []
}

/** Validates territorial authority org refs resolve to campaign organizations on regions. */
export async function validateTerritorialAuthority(ctx: ContentWriteContext): Promise<void> {
  const merged = { ...entityBody(ctx.existing ?? {}), ...ctx.input }
  const kind = merged.kind ?? entityBody(ctx.existing ?? {}).kind

  const normalizedTerritorialAuthority = ctx.normalized.territorialAuthority
  if (kind !== 'region' && Array.isArray(normalizedTerritorialAuthority)) {
    throw new HttpError(400, 'validation_error', 'Territorial authority is only valid on regions.')
  }

  if (kind !== 'region') {
    return
  }

  const relationships = mergedTerritorialAuthority(ctx)
  if (relationships.length === 0) return

  const organizationIds = [
    ...new Set(
      extractOrganizationIdsFromTerritorialAuthority({ territorialAuthority: relationships }),
    ),
  ]

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
