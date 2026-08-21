import type { EntitySummaryStatusItem } from './entity-summary-status.types'
import type { EntitySummaryModel } from './entity-summary.types'

export type EntitySummaryProjectionInput = {
  heading: EntitySummaryModel['heading']
  /** Inline classification after the heading — may include a leading ` · ` separator. */
  classification?: EntitySummaryModel['classification']
  description?: EntitySummaryModel['description']
  status?: EntitySummaryStatusItem | readonly EntitySummaryStatusItem[]
}

function isEntitySummaryStatusArray(
  status: EntitySummaryStatusItem | readonly EntitySummaryStatusItem[],
): status is readonly EntitySummaryStatusItem[] {
  return Array.isArray(status)
}

function normalizeStatus(
  status: EntitySummaryStatusItem | readonly EntitySummaryStatusItem[] | undefined,
): readonly EntitySummaryStatusItem[] | undefined {
  if (status == null) return undefined
  if (isEntitySummaryStatusArray(status)) return status.slice()
  return [status]
}

/** Maps detail/relationship row props onto the shared entity summary vocabulary. */
export function projectEntitySummaryModel({
  heading,
  classification,
  description,
  status,
}: EntitySummaryProjectionInput): EntitySummaryModel {
  const normalizedStatus = normalizeStatus(status)

  return {
    heading,
    ...(classification != null && classification !== '' ? { classification } : {}),
    ...(description != null && description !== '' ? { description } : {}),
    ...(normalizedStatus && normalizedStatus.length > 0 ? { status: normalizedStatus } : {}),
  }
}
