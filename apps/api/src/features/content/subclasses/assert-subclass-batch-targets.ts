import { HttpError } from '../../../lib/http-error'
import { resolveContentListForCampaign } from '../content.service'
import { subclassContentConfig } from './subclasses.config'
import { resolveSubclassesForCampaign } from './list-subclasses'

/** Reject batch targets that belong to a different parent class than the route classId. */
export async function assertSubclassBatchTargetsBelongToClass(
  campaignId: string,
  routeClassId: string,
  entityIds: readonly string[],
): Promise<void> {
  const allowedSubclasses = await resolveSubclassesForCampaign(campaignId, routeClassId)
  const allowedIds = new Set(allowedSubclasses.map((subclass) => subclass.id))
  const unknownIds = entityIds.filter((entityId) => !allowedIds.has(entityId))

  if (unknownIds.length === 0) {
    return
  }

  const { items: allSubclasses, overlayFailures } = await resolveContentListForCampaign(
    subclassContentConfig,
    campaignId,
  )
  for (const entityId of unknownIds) {
    const overlayFailure = overlayFailures.find((failure) => failure.targetId === entityId)
    if (overlayFailure) {
      throw new HttpError(409, overlayFailure.code, overlayFailure.message)
    }
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
