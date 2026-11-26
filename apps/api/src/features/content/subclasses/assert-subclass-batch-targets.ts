import { SUBCLASS_TARGET_OVERLAY_UNRESOLVED_ISSUE_CODE } from '@rpg/contracts'

import { HttpError } from '../../../lib/http-error'
import { resolveContentListForCampaign } from '../content.service'
import { subclassContentConfig } from './subclasses.config'
import { scopeSubclassesListForClass } from './scope-subclasses-list-for-class'
import { subclassOverlayUnresolvedHttpError } from './subclass-overlay-http-error.lib'

/** Reject batch targets that belong to a different parent class than the route classId. */
export async function assertSubclassBatchTargetsBelongToClass(
  campaignId: string,
  routeClassId: string,
  entityIds: readonly string[],
): Promise<void> {
  const resolution = await resolveContentListForCampaign(subclassContentConfig, campaignId)
  const { subclasses: allowedSubclasses, overlayFailures: scopedOverlayFailures } =
    await scopeSubclassesListForClass(campaignId, routeClassId, resolution)
  const allowedIds = new Set(allowedSubclasses.map((subclass) => subclass.id))
  const unknownIds = entityIds.filter((entityId) => !allowedIds.has(entityId))

  if (unknownIds.length === 0) {
    return
  }

  for (const entityId of unknownIds) {
    const overlayFailure = scopedOverlayFailures.find((failure) => failure.targetId === entityId)
    if (overlayFailure) {
      const failureIndex = entityIds.indexOf(entityId)
      throw subclassOverlayUnresolvedHttpError(
        overlayFailure,
        `targets.${failureIndex}.entityId`,
        SUBCLASS_TARGET_OVERLAY_UNRESOLVED_ISSUE_CODE,
      )
    }
  }

  for (const entityId of unknownIds) {
    const match = resolution.items.find((subclass) => subclass.id === entityId)
    if (match && match.classId !== routeClassId) {
      throw new HttpError(
        400,
        'mixed_subclass_parents',
        'All batch targets must belong to the specified class.',
      )
    }
  }
}
