import { cn, Button, Text } from '@rpg/ui'
import { Trash2 } from 'lucide-react'

export interface MasterDetailListItem {
  /** Stable React key (use the RHF field id, not a domain id). */
  id: string
  /** Display label for the row. */
  title: string
}

export interface MasterDetailListPanelProps {
  items: MasterDetailListItem[]
  selectedIndex: number | null
  /** Accessible name for the list `<nav>`. */
  ariaLabel: string
  addLabel: string
  emptyLabel: string
  onAdd: () => void
  onSelect: (index: number) => void
  onRemove: (index: number) => void
}

/**
 * Generic sidebar for a master-detail editor: an add button plus a selectable,
 * removable list. Presentation only — selection and array mutation are owned by
 * the parent (see `useMasterDetailArray`).
 */
export function MasterDetailListPanel({
  items,
  selectedIndex,
  ariaLabel,
  addLabel,
  emptyLabel,
  onAdd,
  onSelect,
  onRemove,
}: MasterDetailListPanelProps) {
  return (
    <nav aria-label={ariaLabel} className="flex flex-col gap-3">
      <Button type="button" variant="outline" size="sm" onClick={onAdd}>
        {addLabel}
      </Button>

      {items.length === 0 ? (
        <Text variant="muted" className="text-sm">
          {emptyLabel}
        </Text>
      ) : (
        <ul className="space-y-1" role="list">
          {items.map((item, index) => {
            const isSelected = index === selectedIndex

            return (
              <li key={item.id}>
                <div
                  className={cn(
                    'flex items-center gap-1 rounded-md border border-transparent',
                    isSelected && 'border-border bg-muted/40',
                  )}
                >
                  <button
                    type="button"
                    aria-current={isSelected ? 'true' : undefined}
                    onClick={() => onSelect(index)}
                    className="min-w-0 flex-1 rounded-md px-3 py-2 text-left text-sm hover:bg-muted/60"
                  >
                    <span className="block truncate font-medium">{item.title}</span>
                  </button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="mr-1 size-8 shrink-0 p-0"
                    aria-label={`Remove ${item.title}`}
                    onClick={() => onRemove(index)}
                  >
                    <Trash2 className="size-4" aria-hidden />
                  </Button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </nav>
  )
}
