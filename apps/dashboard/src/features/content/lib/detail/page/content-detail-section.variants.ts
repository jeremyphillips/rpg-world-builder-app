/**
 * Content detail section body layouts:
 * - prose: section-owned padding for mixed prose content
 * - list: unpadded — host owns row/list chrome (EntityRowList, DetailCollectionRowList, …)
 * - flush: unpadded — full-bleed child owns layout (tables, item stacks, …)
 */

import { cn } from '@rpg/ui'

/** Padded prose body inside a faint section panel. */
export const contentDetailSectionProseBodyClasses = 'px-4 py-4'

/** Prose block above a flush stack — no bottom padding before full-bleed children. */
export const contentDetailSectionProseBodyFlushFollowClasses = cn(
  contentDetailSectionProseBodyClasses,
  'pb-0',
)

/** Vertical rhythm between array items inside a section panel. */
export const contentDetailSectionItemStackClasses = 'space-y-4'

/** Spacing for in-panel titles — pair with `Heading variant="subsection"`. */
export const contentDetailSectionPanelContentHeadingClasses = 'mb-2.5'
