import { HttpError } from '../../../lib/http-error'
import { resolveCatalogForCampaign } from '../content.service'
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

  const allSubclasses = await resolveCatalogForCampaign(subclassContentConfig, campaignId)
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
