import { isOrganizationSubtypeValidForKind, type OrganizationKind } from '@rpg/contracts'

import { HttpError } from '../../../lib/http-error'
import type { ContentWriteContext } from '../lib/content-write-config'

function entityBody(entity: Record<string, unknown>): Record<string, unknown> {
  const {
    id: _id,
    slug: _slug,
    rulesetId: _rulesetId,
    source: _source,
    campaignId: _campaignId,
    createdAt: _createdAt,
    updatedAt: _updatedAt,
    status: _status,
    ...body
  } = entity
  return body
}

/**
 * Validates the effective kind/subtype pair on create/update.
 * Rejects incompatible merged pairs — never silently clears subtype.
 */
export async function organizationValidateBeforeWrite(ctx: ContentWriteContext): Promise<void> {
  const mergedRaw =
    ctx.mode === 'update' && ctx.existing
      ? {
          ...entityBody(ctx.existing as unknown as Record<string, unknown>),
          ...ctx.input,
        }
      : ctx.input

  const merged = { ...mergedRaw }
  if (merged.organizationSubtype === null) {
    delete merged.organizationSubtype
  }

  const organizationKind = merged.organizationKind
  const organizationSubtype = merged.organizationSubtype

  if (typeof organizationSubtype !== 'string') return

  if (typeof organizationKind !== 'string') {
    throw new HttpError(400, 'validation_error', 'organizationSubtype requires organizationKind.', {
      fieldErrors: { organizationSubtype: ['organizationSubtype requires organizationKind.'] },
    })
  }

  if (
    !isOrganizationSubtypeValidForKind(organizationKind as OrganizationKind, organizationSubtype)
  ) {
    throw new HttpError(
      400,
      'validation_error',
      `organizationSubtype '${organizationSubtype}' is not valid for organizationKind '${organizationKind}'.`,
      {
        fieldErrors: {
          organizationSubtype: [
            `organizationSubtype '${organizationSubtype}' is not valid for organizationKind '${organizationKind}'.`,
          ],
        },
      },
    )
  }
}
