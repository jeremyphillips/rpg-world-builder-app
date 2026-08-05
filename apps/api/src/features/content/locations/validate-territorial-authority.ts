import { HttpError } from '../../../lib/http-error'

import type { ContentWriteContext } from '../lib/content-write-config'
import { validateTerritorialAuthorityRelationships } from './validate-territorial-authority-relationships'

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

function mergedTerritorialAuthority(ctx: ContentWriteContext) {
  const existingBody = ctx.existing
    ? entityBody(ctx.existing as unknown as Record<string, unknown>)
    : {}
  const merged = { ...existingBody, ...ctx.input }
  const relationships = merged.territorialAuthority
  return Array.isArray(relationships) ? relationships : []
}

/** Validates territorial authority org refs resolve to campaign organizations on regions. */
export async function validateTerritorialAuthority(ctx: ContentWriteContext): Promise<void> {
  const merged = { ...entityBody(ctx.existing ?? {}), ...ctx.input }
  const kind = merged.kind ?? entityBody(ctx.existing ?? {}).kind

  const submittedTerritorialAuthorityField =
    'territorialAuthority' in ctx.input || 'territorialAuthority' in ctx.normalized

  if (kind !== 'region' && submittedTerritorialAuthorityField) {
    throw new HttpError(400, 'validation_error', 'Territorial authority is only valid on regions.')
  }

  await validateTerritorialAuthorityRelationships({
    campaignId: ctx.campaignId,
    locationKind: typeof kind === 'string' ? kind : undefined,
    relationships: mergedTerritorialAuthority(ctx),
  })
}
