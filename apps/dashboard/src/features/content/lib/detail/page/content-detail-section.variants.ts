/**
 * Content detail section body layouts:
 * - prose: section-owned padding for mixed prose content
 * - list: unpadded — host owns row/list chrome (RelationshipList, DetailCollectionRowList, …)
 * - flush: unpadded — full-bleed child owns layout (tables, item stacks, …)
 */

/** Padded prose body inside a faint section panel. */
export const contentDetailSectionProseBodyClasses = 'px-4 py-4'

/** Vertical rhythm between array items inside a section panel. */
export const contentDetailSectionItemStackClasses = 'space-y-4'

/** In-panel content headings — 19px subsection size, medium (500) weight. */
export const contentDetailSectionPanelContentHeadingClasses =
  'heading-style-subsection mb-2.5 font-medium'
