import { cn, Badge, Button, Text } from '@rpg/ui'
import { AlertCircle, Trash2 } from 'lucide-react'

export interface MasterDetailListItem {
  /** Stable React key (use the RHF field id, not a domain id). */
  id: string
  /** Display label for the row. */
  title: string
  /** Optional small label rendered above the title (e.g. "Level 3"). */
  eyebrow?: string
  /** Optional status badge (e.g. ownership). */
  badge?: { label: string; variant?: 'secondary' | 'outline' }
  /** When true, surfaces a validation error indicator on the row. */
  hasError?: boolean
  /**
   * Whether the row shows a remove control. Defaults to `true`; pass `false`
   * for protected rows (e.g. system content).
   */
  deletable?: boolean
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
  /** Invoked when a deletable row's remove control is activated. */
  onRemove: (index: number) => void
}

/**
 * Generic sidebar for a master-detail editor: an add button plus a selectable,
 * optionally-removable list with an optional eyebrow and status badge per row.
 * Presentation only — selection and array mutation are owned by the parent (see
 * `useMasterDetailArray`).
 *
 * Future capability: an "Active in campaign" affordance would attach to the
 * detail panel (caller-owned), not this list; the `badge` slot can surface an
 * "Inactive" marker once per-row availability has a contract + persistence.
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
            const deletable = item.deletable !== false

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
                    aria-invalid={item.hasError ? true : undefined}
                    onClick={() => onSelect(index)}
                    className="min-w-0 flex-1 rounded-md px-3 py-2 text-left text-sm hover:bg-muted/60"
                  >
                    {item.eyebrow ? (
                      <span className="block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {item.eyebrow}
                      </span>
                    ) : null}
                    <span className="block truncate font-medium">{item.title}</span>
                    {item.hasError || item.badge ? (
                      <span className="mt-1 flex flex-wrap items-center gap-1">
                        {item.hasError ? (
                          <>
                            <AlertCircle
                              className="size-3.5 shrink-0 text-destructive"
                              aria-hidden
                            />
                            <span className="sr-only">Has validation errors</span>
                          </>
                        ) : null}
                        {item.badge ? (
                          <Badge variant={item.badge.variant ?? 'outline'} className="text-[10px]">
                            {item.badge.label}
                          </Badge>
                        ) : null}
                      </span>
                    ) : null}
                  </button>
                  {deletable ? (
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
                  ) : null}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </nav>
  )
}
