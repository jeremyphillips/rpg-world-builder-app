import { useEffect, useRef, type ReactNode, type RefObject } from 'react'
import {
  ActionButton,
  cn,
  Heading,
  InteractiveListEmpty,
  ScrollBoundaryRegion,
  scrollBoundaryRegionRootClasses,
  ValidationIssueCountBadge,
} from '@rpg/ui'

import { isElementOutsideScrollport } from '../../lib/master-detail/is-element-outside-scrollport'
import type { MasterDetailItemMeta } from '../../lib/master-detail/master-detail-item-meta'
import { MasterDetailListRow } from './master-detail-list-row'
import { masterDetailEmptyListLabel } from '../../lib/master-detail/master-detail-constants'
import type { MasterDetailItemNounTerm } from '../../lib/master-detail/master-detail-item-noun'
import {
  masterDetailListBodyClasses,
  masterDetailListScrollViewportClasses,
  masterDetailListShellClasses,
} from './master-detail-list-panel.layout'

export type { MasterDetailItemMeta }

export type MasterDetailListItem = {
  /** Stable domain row id (`resolveMasterDetailRowKey`), or the resource id. */
  id: string
  /** Display label for the row. */
  title: string
  /** Structured subtitle parts for list row content and detail identity. */
  meta?: MasterDetailItemMeta
  /** Unique presentation-path issue count for the row; badge omitted when zero. */
  issueCount?: number
  /** When true, surfaces a validation error indicator on the row. */
  hasError?: boolean
  /** When false, detail overflow hides delete. Not shown on list rows. */
  deletable?: boolean
  /** Broad campaign availability label rendered below the title when unavailable. */
  availabilityStatusLabel?: 'Unavailable'
}

export type MasterDetailListGroup = {
  id: string
  title: ReactNode
  addControl?: ReactNode
  items: MasterDetailListItem[]
}

export type MasterDetailListPanelProps = {
  /** Domain row id of the selected item, or null when nothing in this rail is selected. */
  selectedItemId: string | null
  onSelectItem: (id: string) => void
  /** Visible collection title. Omit on a grouped rail when each group has its own title. */
  listTitle?: ReactNode
  /** Accessible name for the list `<nav>` — independent from `listTitle`. */
  ariaLabel: string
  itemNoun: MasterDetailItemNounTerm
  /** Flat collection. Mutually exclusive with `groups`. */
  items?: MasterDetailListItem[]
  /** Grouped collection: one nav, one scrollport, one count, per-group add. */
  groups?: MasterDetailListGroup[]
  addLabel?: string
  /**
   * Replaces the default Add button on a flat rail. Grouped rails use each group's
   * `addControl` instead.
   */
  addControl?: ReactNode
  onAdd?: () => void
  /** Optional stable availability count row rendered below the list header. */
  countSupplement?: ReactNode
  /** Count of visible list rows with validation issues (not total issue count). */
  invalidItemCount?: number
}

function buildVisibleListProjection(items: readonly MasterDetailListItem[]): string {
  return items.map((item) => item.id).join('\0')
}

function useScrollSelectedRowIntoView(
  selectedItemId: string | null,
  visibleProjection: string,
  scrollRef: RefObject<HTMLDivElement | null>,
  selectedRowRef: RefObject<HTMLButtonElement | null>,
) {
  const didMountRef = useRef(false)
  const previousSelectionIdRef = useRef<string | null>(null)
  const previousProjectionRef = useRef('')

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
  }, [scrollRef, selectedItemId, selectedRowRef, visibleProjection])
}

/**
 * Generic sidebar for a master-detail editor: bordered collection shell with
 * list title + Add, and compact interactive-list row selection in the scrollport.
 * Presentation only — selection and array mutation are owned by the parent.
 */
function MasterDetailListRows({
  items,
  selectedItemId,
  onSelectItem,
  selectedRowRef,
}: {
  items: readonly MasterDetailListItem[]
  selectedItemId: string | null
  onSelectItem: (id: string) => void
  selectedRowRef: RefObject<HTMLButtonElement | null>
}) {
  return (
    <ul className={masterDetailListBodyClasses} role="list">
      {items.map((item) => (
        <MasterDetailListRow
          key={item.id}
          item={item}
          isSelected={item.id === selectedItemId}
          onSelect={onSelectItem}
          selectedRowRef={selectedRowRef}
        />
      ))}
    </ul>
  )
}

function MasterDetailListScroll({
  groups,
  items,
  emptyLabel,
  selectedItemId,
  onSelectItem,
  selectedRowRef,
  scrollRef,
}: {
  groups?: MasterDetailListGroup[]
  items: readonly MasterDetailListItem[]
  emptyLabel: string
  selectedItemId: string | null
  onSelectItem: (id: string) => void
  selectedRowRef: RefObject<HTMLButtonElement | null>
  scrollRef: RefObject<HTMLDivElement | null>
}) {
  if (groups) {
    return (
      <ScrollBoundaryRegion
        className={scrollBoundaryRegionRootClasses}
        viewportClassName={masterDetailListScrollViewportClasses}
        viewportRef={scrollRef}
        data-master-detail-list-scroll
      >
        {groups.map((group) => (
          <section
            key={group.id}
            aria-label={typeof group.title === 'string' ? group.title : group.id}
          >
            <div className="flex shrink-0 items-center justify-between gap-3 border-b ui-border--subtle px-3 py-2.5">
              <Heading as="div" variant="card" className="min-w-0">
                {group.title}
              </Heading>
              {group.addControl}
            </div>
            {group.items.length > 0 ? (
              <MasterDetailListRows
                items={group.items}
                selectedItemId={selectedItemId}
                onSelectItem={onSelectItem}
                selectedRowRef={selectedRowRef}
              />
            ) : null}
          </section>
        ))}
      </ScrollBoundaryRegion>
    )
  }

  if (items.length === 0) {
    return <InteractiveListEmpty className="text-start">{emptyLabel}</InteractiveListEmpty>
  }

  return (
    <ScrollBoundaryRegion
      className={scrollBoundaryRegionRootClasses}
      viewportClassName={masterDetailListScrollViewportClasses}
      viewportRef={scrollRef}
      data-master-detail-list-scroll
    >
      <MasterDetailListRows
        items={items}
        selectedItemId={selectedItemId}
        onSelectItem={onSelectItem}
        selectedRowRef={selectedRowRef}
      />
    </ScrollBoundaryRegion>
  )
}

function listPanelItems(props: MasterDetailListPanelProps): MasterDetailListItem[] {
  if (props.groups) return props.groups.flatMap((group) => group.items)
  return props.items ?? []
}

function MasterDetailCollectionHeader({
  groups,
  listTitle,
  addControl,
  addLabel,
  onAdd,
}: Pick<MasterDetailListPanelProps, 'groups' | 'listTitle' | 'addControl' | 'addLabel' | 'onAdd'>) {
  if (groups && listTitle == null) return null
  const addButton = groups
    ? null
    : (addControl ?? (
        <ActionButton action="add" variant="outline" size="sm" onClick={() => onAdd?.()}>
          {addLabel}
        </ActionButton>
      ))
  return (
    <div className="flex shrink-0 items-center justify-between gap-3 border-b ui-border--subtle px-3 py-2.5">
      <Heading as="div" variant="card" className="min-w-0">
        {listTitle}
      </Heading>
      {addButton}
    </div>
  )
}

function MasterDetailCountRow({
  countSupplement,
  invalidItemCount,
}: Pick<MasterDetailListPanelProps, 'countSupplement' | 'invalidItemCount'>) {
  if (!countSupplement && !invalidItemCount) return null
  return (
    <div
      className={cn(
        'flex shrink-0 items-center gap-2 border-b ui-border--subtle px-3 py-1.5 text-style-caption',
        countSupplement ? 'justify-between' : 'justify-end',
      )}
    >
      {countSupplement ? (
        <div className="min-w-0 flex flex-wrap items-center gap-x-1">{countSupplement}</div>
      ) : null}
      {invalidItemCount && invalidItemCount > 0 ? (
        <ValidationIssueCountBadge count={invalidItemCount} />
      ) : null}
    </div>
  )
}

export function MasterDetailListPanel(props: MasterDetailListPanelProps) {
  const { selectedItemId, onSelectItem, ariaLabel, itemNoun, invalidItemCount = 0 } = props
  const items = listPanelItems(props)
  const emptyLabel = masterDetailEmptyListLabel(itemNoun)
  const scrollRef = useRef<HTMLDivElement>(null)
  const selectedRowRef = useRef<HTMLButtonElement>(null)
  useScrollSelectedRowIntoView(
    selectedItemId,
    buildVisibleListProjection(items),
    scrollRef,
    selectedRowRef,
  )

  return (
    <nav aria-label={ariaLabel} className={masterDetailListShellClasses}>
      <MasterDetailCollectionHeader
        groups={props.groups}
        listTitle={props.listTitle}
        addControl={props.addControl}
        addLabel={props.addLabel}
        onAdd={props.onAdd}
      />
      <MasterDetailCountRow
        countSupplement={props.countSupplement}
        invalidItemCount={invalidItemCount}
      />
      <MasterDetailListScroll
        groups={props.groups}
        items={items}
        emptyLabel={emptyLabel}
        selectedItemId={selectedItemId}
        onSelectItem={onSelectItem}
        selectedRowRef={selectedRowRef}
        scrollRef={scrollRef}
      />
    </nav>
  )
}
