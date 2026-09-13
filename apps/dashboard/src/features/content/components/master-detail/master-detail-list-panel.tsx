import { useEffect, useRef, type ReactNode, type RefObject } from 'react'
import { Plus } from 'lucide-react'
import { Button, InlineInactiveStatus, Text } from '@rpg/ui'

import { isElementOutsideScrollport } from '../../lib/master-detail/is-element-outside-scrollport'
import {
  joinMasterDetailItemMeta,
  type MasterDetailItemMeta,
} from '../../lib/master-detail/master-detail-item-meta'
import { masterDetailEmptyListLabel } from '../../lib/master-detail/master-detail-constants'
import type { MasterDetailItemNounTerm } from '../../lib/master-detail/master-detail-item-noun'
import {
  masterDetailListCountSupplementClasses,
  masterDetailListEmptyClasses,
  masterDetailListHeaderClasses,
  masterDetailListItemsClasses,
  masterDetailListRowClasses,
  masterDetailListRowAvailabilityClasses,
  masterDetailListRowMetaClasses,
  masterDetailListRowTitleClasses,
  masterDetailListScrollClasses,
  masterDetailListShellClasses,
  masterDetailListTitleClasses,
} from './master-detail-list-panel.variants'

export type { MasterDetailItemMeta }

export interface MasterDetailListItem {
  /** Stable React key (use the RHF field id, not a domain id). */
  id: string
  /** Display label for the row. */
  title: string
  /** Structured subtitle parts joined with ` · ` for display. */
  meta?: MasterDetailItemMeta
  /** When true, surfaces a validation error indicator on the row. */
  hasError?: boolean
  /** When false, row uses inactive styling. Defaults to `true`. */
  active?: boolean
  /** When false, detail overflow hides delete. Not shown on list rows. */
  deletable?: boolean
  /** Broad campaign availability label rendered below the title when unavailable. */
  availabilityStatusLabel?: 'Unavailable'
}

export interface MasterDetailListPanelProps {
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
}

interface MasterDetailListRowProps {
  item: MasterDetailListItem
  index: number
  isSelected: boolean
  onSelect: (index: number) => void
  selectedRowRef?: RefObject<HTMLButtonElement | null>
}

function MasterDetailListRow({
  item,
  index,
  isSelected,
  onSelect,
  selectedRowRef,
}: MasterDetailListRowProps) {
  const active = item.active !== false
  const metaLine = item.meta ? joinMasterDetailItemMeta(item.meta) : undefined

  return (
    <li>
      <button
        ref={isSelected ? selectedRowRef : undefined}
        type="button"
        aria-current={isSelected ? 'true' : undefined}
        aria-invalid={item.hasError ? true : undefined}
        onClick={() => onSelect(index)}
        className={masterDetailListRowClasses({ active, isSelected })}
      >
        {metaLine ? <span className={masterDetailListRowMetaClasses}>{metaLine}</span> : null}
        <span className={masterDetailListRowTitleClasses}>{item.title}</span>
        {item.availabilityStatusLabel ? (
          <InlineInactiveStatus
            label={item.availabilityStatusLabel}
            className={masterDetailListRowAvailabilityClasses}
          />
        ) : null}
        {item.hasError ? <span className="sr-only">Has validation errors</span> : null}
      </button>
    </li>
  )
}

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
 * list title + Add, and whole-row selection with tint and inset start accent.
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

  return (
    <nav aria-label={ariaLabel} className={masterDetailListShellClasses}>
      <div className={masterDetailListHeaderClasses}>
        <div className={masterDetailListTitleClasses}>{listTitle}</div>
        <Button type="button" variant="outline" size="sm" onClick={onAdd}>
          <Plus aria-hidden />
          {addLabel}
        </Button>
      </div>

      {countSupplement ? (
        <div className={masterDetailListCountSupplementClasses}>{countSupplement}</div>
      ) : null}

      {items.length === 0 ? (
        <Text variant="muted" className={masterDetailListEmptyClasses}>
          {emptyLabel}
        </Text>
      ) : (
        <div
          ref={scrollRef}
          data-master-detail-list-scroll
          className={masterDetailListScrollClasses}
        >
          <ul className={masterDetailListItemsClasses} role="list">
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
        </div>
      )}
    </nav>
  )
}
