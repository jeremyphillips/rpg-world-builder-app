import type { TerritorialAuthorityRelationship } from '@rpg/contracts'
import { territorialAuthorityRelationshipsSchema } from '@rpg/contracts'

import { HttpError } from '../../../lib/http-error'
import { HomebrewOrganizationModel } from '../organizations/homebrew-organization.model'
import { extractOrganizationIdsFromTerritorialAuthority } from './location-territorial-authority-reference.lib'

/** Shared territorial authority validation for full PATCH and nested mutation routes. */
export async function validateTerritorialAuthorityRelationships(input: {
  campaignId: string
  locationKind: string | undefined
  relationships: readonly TerritorialAuthorityRelationship[]
}): Promise<void> {
  const { campaignId, locationKind, relationships } = input

  if (locationKind !== 'region' && relationships.length > 0) {
    throw new HttpError(400, 'validation_error', 'Territorial authority is only valid on regions.')
  }

  if (locationKind !== 'region') {
    return
  }

  territorialAuthorityRelationshipsSchema.parse(relationships)

  if (relationships.length === 0) {
    return
  }

  const organizationIds = [
    ...new Set(
      extractOrganizationIdsFromTerritorialAuthority({ territorialAuthority: relationships }),
    ),
  ]

  const docs = await HomebrewOrganizationModel.find({
    _id: { $in: organizationIds },
    campaignId,
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
