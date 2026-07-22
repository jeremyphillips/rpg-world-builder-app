import type { CharacterClass } from '@rpg/contracts'

import { HttpError } from '../../../lib/http-error'
import { resolveCatalogForCampaign } from '../content.service'
import { classContentConfig } from '../classes/classes.config'

export async function assertSubclassParentClassExists(
  campaignId: string,
  classId: string,
): Promise<CharacterClass> {
  const classes = await resolveCatalogForCampaign(classContentConfig, campaignId)
  const parentClass = classes.find((record) => record.id === classId)
  if (!parentClass) {
    throw new HttpError(400, 'validation_error', 'Parent class not found in campaign catalog.')
  }
  return parentClass
}

export function assertSubclassRouteClassId(
  mode: 'create' | 'update',
  routeClassId: string,
  body: Record<string, unknown>,
): Record<string, unknown> {
  const next = { ...body }

  if (mode === 'create') {
    next.classId = routeClassId
    return next
  }

  if ('classId' in next && next.classId !== undefined && next.classId !== routeClassId) {
    throw new HttpError(
      400,
      'validation_error',
      'Body classId must match the route classId or be omitted.',
    )
  }

  delete next.classId
  return next
}
