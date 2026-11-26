import type { CharacterClass } from '@rpg/contracts'

import { HttpError } from '../../../lib/http-error'
import { resolveContentListForCampaign } from '../content.service'
import { classContentConfig } from '../classes/classes.config'

export async function assertSubclassParentClassExists(
  campaignId: string,
  classId: string,
): Promise<CharacterClass> {
  const { items: classes, overlayFailures } = await resolveContentListForCampaign(
    classContentConfig,
    campaignId,
  )
  const parentClass = classes.find((record) => record.id === classId)
  if (!parentClass) {
    const overlayFailure = overlayFailures.find((failure) => failure.targetId === classId)
    if (overlayFailure) {
      throw new HttpError(409, overlayFailure.code, overlayFailure.message)
    }
    throw new HttpError(400, 'validation_error', 'Parent class not found in campaign catalog.', {
      issues: [
        {
          path: 'classId',
          code: 'unknown_class',
          message: 'Parent class not found in campaign catalog.',
        },
      ],
    })
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
      {
        issues: [
          {
            path: 'classId',
            code: 'mismatched_subclass_parent',
            message: 'Body classId must match the route classId or be omitted.',
          },
        ],
      },
    )
  }

  delete next.classId
  return next
}
