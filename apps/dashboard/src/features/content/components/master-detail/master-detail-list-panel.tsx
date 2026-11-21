import { useEffect, useRef, type ReactNode, type RefObject } from 'react'
import {
  ActionButton,
  cn,
  Heading,
  InteractiveList,
  InteractiveListEmpty,
  ScrollBoundaryRegion,
  scrollBoundaryRegionRootClasses,
  ValidationIssueCountBadge,
} from '@rpg/ui'

import { isElementOutsideScrollport } from '../../lib/master-detail/is-element-outside-scrollport'
import type { MasterDetailListItem } from '../../lib/master-detail/master-detail-list-item.types'
import type { MasterDetailItemMeta } from '../../lib/master-detail/master-detail-item-meta'
import { MasterDetailListRow } from './master-detail-list-row'
import { MasterDetailSortableListRows } from './master-detail-sortable-list-rows.client'
import {
  masterDetailEmptyListLabel,
  masterDetailEmptySectionLabel,
} from '../../lib/master-detail/master-detail-constants'
import type { MasterDetailItemNounTerm } from '../../lib/master-detail/master-detail-item-noun'
import {
  masterDetailListBodyClasses,
  masterDetailListHeaderClasses,
  masterDetailListScrollViewportClasses,
  masterDetailListSectionHeaderClasses,
  masterDetailListShellClasses,
  masterDetailListSupplementClasses,
} from './master-detail-list-panel.layout'

export type { MasterDetailItemMeta, MasterDetailListItem }

export type MasterDetailListGroup = {
  id: string
  title: ReactNode
  /** Ghost icon add — superseded by `addControl` (for example acquisition menus). */
  onAdd?: () => void
  addControl?: ReactNode
  items: MasterDetailListItem[]
  /** Section empty copy — defaults to the panel's flat `itemNoun` empty label. */
  emptyLabel?: ReactNode
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
  /** Accessible name for the default icon-only add control on a flat rail. */
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
  /** When set on a flat rail with more than one row, enables drag-to-reorder handles. */
  onListMove?: (from: number, to: number) => void
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

function MasterDetailListAddButton({ addLabel, onAdd }: { addLabel?: string; onAdd?: () => void }) {
  if (!onAdd) return null
  return (
    <ActionButton
      action="add"
      variant="ghost"
      size="icon-sm"
      aria-label={addLabel}
      onClick={() => onAdd()}
    />
  )
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
  onListMove,
}: {
  items: readonly MasterDetailListItem[]
  selectedItemId: string | null
  onSelectItem: (id: string) => void
  selectedRowRef: RefObject<HTMLButtonElement | null>
  onListMove?: (from: number, to: number) => void
}) {
  if (onListMove) {
    return (
      <MasterDetailSortableListRows
        items={items}
        selectedItemId={selectedItemId}
        onSelectItem={onSelectItem}
        onMove={onListMove}
        selectedRowRef={selectedRowRef}
        listClassName={masterDetailListBodyClasses}
      />
    )
  }

  return (
    <ul className={masterDetailListBodyClasses} role="list">
      {items.map((item) => (
        <MasterDetailListRow
          key={item.id}
          item={item}
          isSelected={item.id === selectedItemId}
          onSelect={onSelectItem}
          selectedRowRef={item.id === selectedItemId ? selectedRowRef : undefined}
        />
      ))}
    </ul>
  )
}

function MasterDetailListSectionEmpty({ children }: { children: ReactNode }) {
  return (
    <InteractiveList density="compact" className={masterDetailListBodyClasses}>
      <InteractiveListEmpty align="start">{children}</InteractiveListEmpty>
    </InteractiveList>
  )
}

function resolveGroupEmptyLabel(
  group: MasterDetailListGroup,
  defaultEmptyLabel: string,
): ReactNode {
  if (group.emptyLabel != null) return group.emptyLabel
  if (typeof group.title === 'string') {
    const trimmed = group.title.trim()
    if (trimmed.length > 0) {
      return masterDetailEmptySectionLabel(trimmed.toLowerCase())
    }
  }
  return defaultEmptyLabel
}

function MasterDetailListScroll({
  groups,
  items,
  emptyLabel,
  selectedItemId,
  onSelectItem,
  selectedRowRef,
  scrollRef,
  onListMove,
  addLabel,
}: {
  groups?: MasterDetailListGroup[]
  items: readonly MasterDetailListItem[]
  emptyLabel: string
  selectedItemId: string | null
  onSelectItem: (id: string) => void
  selectedRowRef: RefObject<HTMLButtonElement | null>
  scrollRef: RefObject<HTMLDivElement | null>
  onListMove?: (from: number, to: number) => void
  addLabel?: string
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
            <div className={masterDetailListSectionHeaderClasses}>
              <Heading as="div" variant="nav" className="min-w-0">
                {group.title}
              </Heading>
              {group.addControl ?? (
                <MasterDetailListAddButton addLabel={addLabel} onAdd={group.onAdd} />
              )}
            </div>
            {group.items.length > 0 ? (
              <MasterDetailListRows
                items={group.items}
                selectedItemId={selectedItemId}
                onSelectItem={onSelectItem}
                selectedRowRef={selectedRowRef}
              />
            ) : (
              <MasterDetailListSectionEmpty>
                {resolveGroupEmptyLabel(group, emptyLabel)}
              </MasterDetailListSectionEmpty>
            )}
          </section>
        ))}
      </ScrollBoundaryRegion>
    )
  }

  if (items.length === 0) {
    return <InteractiveListEmpty align="start">{emptyLabel}</InteractiveListEmpty>
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
        onListMove={onListMove}
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
    : (addControl ?? <MasterDetailListAddButton addLabel={addLabel} onAdd={onAdd} />)
  return (
    <div className={masterDetailListHeaderClasses}>
      <Heading as="div" variant="nav" className="min-w-0">
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
        masterDetailListSupplementClasses,
        'text-style-caption',
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
  const {
    selectedItemId,
    onSelectItem,
    ariaLabel,
    itemNoun,
    invalidItemCount = 0,
    onListMove,
  } = props
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
        onListMove={props.groups ? undefined : onListMove}
        addLabel={props.addLabel}
      />
    </nav>
  )
}
