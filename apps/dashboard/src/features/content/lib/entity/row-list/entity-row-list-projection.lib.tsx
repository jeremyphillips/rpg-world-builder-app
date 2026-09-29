import type { ReactNode } from 'react'

import type { EntitySummaryStatusItem } from '../summary/entity-summary-status.types'

/** Inline suffix lane: classification first, then headingAccessory (callers own separators). */
export function composeEntityRowListHeadingSuffix(
  classification?: ReactNode,
  headingAccessory?: ReactNode,
): ReactNode | undefined {
  if (classification == null || classification === '') {
    return headingAccessory == null || headingAccessory === '' ? undefined : headingAccessory
  }
  if (headingAccessory == null || headingAccessory === '') {
    return classification
  }

  return (
    <>
      {classification}
      {headingAccessory}
    </>
  )
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
