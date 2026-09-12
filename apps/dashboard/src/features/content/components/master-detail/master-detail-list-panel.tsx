import type { ReactNode } from 'react'
import { Plus } from 'lucide-react'
import { Button, Text, cn } from '@rpg/ui'

import {
  joinMasterDetailItemMeta,
  type MasterDetailItemMeta,
} from '../../lib/master-detail/master-detail-item-meta'
import {
  masterDetailListEmptyClasses,
  masterDetailListHeaderClasses,
  masterDetailListItemsClasses,
  masterDetailListRowClasses,
  masterDetailListRowMetaClasses,
  masterDetailListRowTitleClasses,
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
}

export interface MasterDetailListPanelProps {
  items: MasterDetailListItem[]
  selectedIndex: number | null
  /** Visible collection title in the list header. */
  listTitle: ReactNode
  /** Accessible name for the list `<nav>` — independent from `listTitle`. */
  ariaLabel: string
  addLabel: string
  emptyLabel: string
  onAdd: () => void
  onSelect: (index: number) => void
}

interface MasterDetailListRowProps {
  item: MasterDetailListItem
  index: number
  isSelected: boolean
  onSelect: (index: number) => void
}

function MasterDetailListRow({ item, index, isSelected, onSelect }: MasterDetailListRowProps) {
  const active = item.active !== false
  const metaLine = item.meta ? joinMasterDetailItemMeta(item.meta) : undefined

  return (
    <li>
      <button
        type="button"
        aria-current={isSelected ? 'true' : undefined}
        aria-invalid={item.hasError ? true : undefined}
        onClick={() => onSelect(index)}
        className={masterDetailListRowClasses({ active, isSelected })}
      >
        {metaLine ? <span className={masterDetailListRowMetaClasses}>{metaLine}</span> : null}
        <span className={masterDetailListRowTitleClasses}>{item.title}</span>
        {item.hasError ? <span className="sr-only">Has validation errors</span> : null}
      </button>
    </li>
  )
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
  emptyLabel,
  onAdd,
  onSelect,
}: MasterDetailListPanelProps) {
  return (
    <nav aria-label={ariaLabel} className={masterDetailListShellClasses}>
      <div className={masterDetailListHeaderClasses}>
        <div className={masterDetailListTitleClasses}>{listTitle}</div>
        <Button type="button" variant="outline" size="sm" onClick={onAdd}>
          <Plus aria-hidden />
          {addLabel}
        </Button>
      </div>

      {items.length === 0 ? (
        <Text variant="muted" className={cn(masterDetailListEmptyClasses, 'whitespace-pre-line')}>
          {emptyLabel}
        </Text>
      ) : (
        <ul className={masterDetailListItemsClasses} role="list">
          {items.map((item, index) => (
            <MasterDetailListRow
              key={item.id}
              item={item}
              index={index}
              isSelected={index === selectedIndex}
              onSelect={onSelect}
            />
          ))}
        </ul>
      )}
    </nav>
  )
}
