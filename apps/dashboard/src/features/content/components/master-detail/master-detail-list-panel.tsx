import { useEffect, useRef, type ReactNode } from 'react'
import {
  ActionButton,
  cn,
  panelVariants,
  ScrollBoundaryRegion,
  scrollBoundaryRegionRootClasses,
  Text,
  ValidationIssueCountBadge,
} from '@rpg/ui'

import { isElementOutsideScrollport } from '../../lib/master-detail/is-element-outside-scrollport'
import type { MasterDetailItemMeta } from '../../lib/master-detail/master-detail-item-meta'
import { MasterDetailListRow } from './master-detail-list-row'
import { masterDetailEmptyListLabel } from '../../lib/master-detail/master-detail-constants'
import type { MasterDetailItemNounTerm } from '../../lib/master-detail/master-detail-item-noun'

export type { MasterDetailItemMeta }

const masterDetailListShellClasses = cn(
  panelVariants({ tone: 'quiet', density: 'comfortable', bleed: true }),
  'sticky top-[var(--rpg-form-sticky-tabs-block-size,0px)] flex min-h-[min(8rem,var(--master-detail-shell-max-block-size))] flex-col self-start overflow-hidden text-foreground md:min-h-[min(12rem,var(--master-detail-shell-max-block-size))]',
  '[--master-detail-list-chrome-block-size:5.5rem]',
  'master-detail-list-shell-viewport-cap',
)

const masterDetailListScrollViewportClasses = 'min-h-0 flex-1 overflow-y-auto pe-0 scrollbar-slim'

export type MasterDetailListItem = {
  /** Stable React key (use the RHF field id, not a domain id). */
  id: string
  /** Display label for the row. */
  title: string
  /** Structured subtitle parts for list row content and detail identity. */
  meta?: MasterDetailItemMeta
  /** Unique presentation-path issue count for the row; badge omitted when zero. */
  issueCount?: number
  /** When true, surfaces a validation error indicator on the row. */
  hasError?: boolean
  /** When false, row uses inactive styling. Defaults to `true`. */
  active?: boolean
  /** When false, detail overflow hides delete. Not shown on list rows. */
  deletable?: boolean
  /** Broad campaign availability label rendered below the title when unavailable. */
  availabilityStatusLabel?: 'Unavailable'
}

export type MasterDetailListPanelProps = {
  items: MasterDetailListItem[]
  selectedIndex: number | null
  /** Visible collection title in the list header. */
  listTitle: ReactNode
  /** Accessible name for the list `<nav>` — independent from `listTitle`. */
  ariaLabel: string
  addLabel: string
  itemNoun: MasterDetailItemNounTerm
  onAdd: () => void
  onSelect: (index: number) => void
  /** Optional stable availability count row rendered below the list header. */
  countSupplement?: ReactNode
  /** Count of visible list rows with validation issues (not total issue count). */
  invalidItemCount?: number
}

/** @internal Layout contract tests assert on shell and scroll class strings. */
export const masterDetailListLayoutClasses = {
  shell: masterDetailListShellClasses,
  scrollRegion: scrollBoundaryRegionRootClasses,
  scrollViewport: masterDetailListScrollViewportClasses,
} as const

function resolveSelectedItemId(
  items: MasterDetailListItem[],
  selectedIndex: number | null,
): string | null {
  if (selectedIndex === null || selectedIndex < 0 || selectedIndex >= items.length) {
    return null
  }
  return items[selectedIndex]?.id ?? null
}

function buildVisibleListProjection(items: readonly MasterDetailListItem[]): string {
  return items.map((item) => item.id).join('\0')
}

/**
 * Generic sidebar for a master-detail editor: bordered collection shell with
 * list title + Add, and card-style row selection in the scrollport.
 * Presentation only — selection and array mutation are owned by the parent.
 */
export function MasterDetailListPanel({
  items,
  selectedIndex,
  listTitle,
  ariaLabel,
  addLabel,
  itemNoun,
  onAdd,
  onSelect,
  countSupplement,
  invalidItemCount = 0,
}: MasterDetailListPanelProps) {
  const emptyLabel = masterDetailEmptyListLabel(itemNoun)
  const scrollRef = useRef<HTMLDivElement>(null)
  const selectedRowRef = useRef<HTMLButtonElement>(null)
  const didMountRef = useRef(false)
  const previousSelectionIdRef = useRef<string | null>(null)
  const previousProjectionRef = useRef('')

  const selectedItemId = resolveSelectedItemId(items, selectedIndex)
  const visibleProjection = buildVisibleListProjection(items)

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true
      previousSelectionIdRef.current = selectedItemId
      previousProjectionRef.current = visibleProjection
      return
    }

    const selectionChanged = selectedItemId !== previousSelectionIdRef.current
    const projectionChanged = visibleProjection !== previousProjectionRef.current

    previousSelectionIdRef.current = selectedItemId
    previousProjectionRef.current = visibleProjection

    if (!selectionChanged && !projectionChanged) return
    if (!selectedItemId) return

    const row = selectedRowRef.current
    const scrollport = scrollRef.current
    if (!row || !scrollport) return

    if (isElementOutsideScrollport(row, scrollport)) {
      row.scrollIntoView({ block: 'nearest' })
    }
  }, [selectedItemId, visibleProjection])

  const countSupplementRow =
    countSupplement || invalidItemCount > 0
      ? cn(
          'flex shrink-0 items-center gap-2 border-b ui-border--subtle px-3 py-1.5 text-style-caption',
          countSupplement ? 'justify-between' : 'justify-end',
        )
      : null

  return (
    <nav aria-label={ariaLabel} className={masterDetailListShellClasses}>
      <div className="flex shrink-0 items-center justify-between gap-3 border-b ui-border--subtle px-3 py-2.5">
        <div className="min-w-0 text-lg font-medium text-foreground">{listTitle}</div>
        <ActionButton action="add" variant="outline" size="sm" onClick={onAdd}>
          {addLabel}
        </ActionButton>
      </div>

      {countSupplementRow ? (
        <div className={countSupplementRow}>
          {countSupplement ? (
            <div className="min-w-0 flex flex-wrap items-center gap-x-1">{countSupplement}</div>
          ) : null}
          {invalidItemCount > 0 ? <ValidationIssueCountBadge count={invalidItemCount} /> : null}
        </div>
      ) : null}

      {items.length === 0 ? (
        <Text variant="muted" className="px-3 py-4 text-style-supporting">
          {emptyLabel}
        </Text>
      ) : (
        <ScrollBoundaryRegion
          className={scrollBoundaryRegionRootClasses}
          viewportClassName={masterDetailListScrollViewportClasses}
          viewportRef={scrollRef}
          data-master-detail-list-scroll
        >
          <ul className="flex flex-col gap-2 p-2" role="list">
            {items.map((item, index) => (
              <MasterDetailListRow
                key={item.id}
                item={item}
                index={index}
                isSelected={index === selectedIndex}
                onSelect={onSelect}
                selectedRowRef={selectedRowRef}
              />
            ))}
          </ul>
        </ScrollBoundaryRegion>
      )}
    </nav>
  )
}
