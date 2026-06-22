import { cn, Badge, Button, Text } from '@rpg/ui'
import { Trash2 } from 'lucide-react'

import {
  isSubclassActive,
  isSubclassDeletable,
  UNTITLED_SUBCLASS_LABEL,
} from '../lib/subclass-editor-constants'
import type { SubclassListItem } from '../lib/subclass-editor-state'

export interface SubclassListPanelProps {
  items: SubclassListItem[]
  selectedId: string | null
  activeById: Record<string, boolean>
  modifiedIds: ReadonlySet<string>
  onSelect: (id: string) => void
  onAdd: () => void
  onDeleteRequest: (id: string) => void
}

function sourceBadgeVariant(source: SubclassListItem['source']) {
  switch (source) {
    case 'system':
      return 'secondary' as const
    case 'homebrew':
      return 'outline' as const
    case 'unsaved':
      return 'outline' as const
  }
}

function sourceBadgeLabel(source: SubclassListItem['source']) {
  switch (source) {
    case 'system':
      return 'System'
    case 'homebrew':
      return 'Homebrew'
    case 'unsaved':
      return 'Unsaved'
  }
}

export function SubclassListPanel({
  items,
  selectedId,
  activeById,
  modifiedIds,
  onSelect,
  onAdd,
  onDeleteRequest,
}: SubclassListPanelProps) {
  return (
    <nav aria-label="Subclasses" className="flex flex-col gap-3">
      <Button type="button" variant="outline" size="sm" onClick={onAdd}>
        Add subclass
      </Button>

      {items.length === 0 ? (
        <Text variant="muted" className="text-sm">
          No subclasses yet. Add one to get started.
        </Text>
      ) : (
        <ul className="space-y-1" role="list">
          {items.map((item) => {
            const isSelected = item.id === selectedId
            const active = isSubclassActive(activeById, item.id)
            const deletable = isSubclassDeletable(
              item.source === 'unsaved' ? 'homebrew' : item.source,
              item.id,
            )

            return (
              <li key={item.id}>
                <div
                  className={cn(
                    'flex items-center gap-1 rounded-md border border-transparent',
                    !active && 'opacity-60',
                    isSelected && 'border-border bg-muted/40',
                  )}
                >
                  <button
                    type="button"
                    aria-current={isSelected ? 'true' : undefined}
                    onClick={() => onSelect(item.id)}
                    className="min-w-0 flex-1 rounded-md px-3 py-2 text-left text-sm hover:bg-muted/60"
                  >
                    <span className="block truncate font-medium">
                      {item.name || UNTITLED_SUBCLASS_LABEL}
                    </span>
                    <span className="mt-1 flex flex-wrap gap-1">
                      <Badge variant={sourceBadgeVariant(item.source)} className="text-[10px]">
                        {sourceBadgeLabel(item.source)}
                      </Badge>
                      {modifiedIds.has(item.id) ? (
                        <Badge variant="outline" className="text-[10px]">
                          Modified
                        </Badge>
                      ) : null}
                      {!active ? (
                        <Badge variant="outline" className="text-[10px]">
                          Inactive
                        </Badge>
                      ) : null}
                    </span>
                  </button>
                  {deletable ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="mr-1 size-8 shrink-0 p-0"
                      aria-label={`Delete ${item.name}`}
                      onClick={() => onDeleteRequest(item.id)}
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
