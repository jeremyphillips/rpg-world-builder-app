import { SUBCLASS_TARGET_OVERLAY_UNRESOLVED_ISSUE_CODE } from '@rpg/contracts'

import { HttpError } from '../../../lib/http-error'
import { resolveContentListForCampaign } from '../content.service'
import { subclassContentConfig } from './subclasses.config'
import { resolveSubclassesListForCampaign } from './list-subclasses'
import { subclassOverlayUnresolvedHttpError } from './subclass-overlay-http-error.lib'

/** Reject batch targets that belong to a different parent class than the route classId. */
export async function assertSubclassBatchTargetsBelongToClass(
  campaignId: string,
  routeClassId: string,
  entityIds: readonly string[],
): Promise<void> {
  const { subclasses: allowedSubclasses, overlayFailures: scopedOverlayFailures } =
    await resolveSubclassesListForCampaign(campaignId, routeClassId)
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

  const { items: allSubclasses } = await resolveContentListForCampaign(
    subclassContentConfig,
    campaignId,
  )
  for (const entityId of unknownIds) {
    const match = allSubclasses.find((subclass) => subclass.id === entityId)
    if (match && match.classId !== routeClassId) {
      throw new HttpError(
        400,
        'mixed_subclass_parents',
        'All batch targets must belong to the specified class.',
      )
    }
  }
}
