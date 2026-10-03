import type { ReactNode } from 'react'

import type { EntitySummaryStatusItem } from '../summary/entity-summary-status.types'

/** Inline suffix lane: classification first, then headingAccessory (separator-free parts). */
export function composeEntityRowListClassification(
  classification?: ReactNode,
  headingAccessory?: ReactNode,
): readonly ReactNode[] {
  const parts: ReactNode[] = []
  if (classification != null && classification !== '') {
    parts.push(classification)
  }
  if (headingAccessory != null && headingAccessory !== '') {
    parts.push(headingAccessory)
  }
  return parts
}

export function resolveEntityRowListOverflowTriggerLabel(
  heading: ReactNode,
  menuLabel?: string,
): string {
  if (menuLabel) {
    return menuLabel
  }

  if (typeof heading === 'string') {
    const trimmed = heading.trim()
    if (trimmed) {
      return `Actions for ${trimmed}`
    }
  }

  return 'Actions'
}

export function normalizeEntityRowListStatus(
  status: EntitySummaryStatusItem | readonly EntitySummaryStatusItem[] | undefined,
): EntitySummaryStatusItem | readonly EntitySummaryStatusItem[] | undefined {
  if (status == null) return undefined
  return status
}
