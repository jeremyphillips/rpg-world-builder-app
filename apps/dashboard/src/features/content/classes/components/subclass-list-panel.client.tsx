import { cn, Badge, Button, Text } from '@rpg/ui'
import { Trash2 } from 'lucide-react'

import {
  isSubclassActive,
  isSubclassDeletable,
  UNTITLED_SUBCLASS_LABEL,
} from '../lib/subclasses/subclass-editor-constants'
import type { SubclassListItem } from '../lib/subclasses/subclass-editor-state'

export interface SubclassListPanelProps {
  items: SubclassListItem[]
  selectedId: string | null
  activeById: Record<string, boolean>
  modifiedIds: ReadonlySet<string>
  onSelect: (id: string) => void
  onAdd: () => void
  onDeleteRequest: (id: string) => void
}

const SOURCE_BADGE = {
  system: { variant: 'secondary', label: 'System' },
  homebrew: { variant: 'outline', label: 'Homebrew' },
  unsaved: { variant: 'outline', label: 'Unsaved' },
} as const satisfies Record<
  SubclassListItem['source'],
  { variant: 'secondary' | 'outline'; label: string }
>

function subclassRowShellClass(isSelected: boolean, active: boolean) {
  return cn(
    'flex items-center gap-1 rounded-md border border-transparent',
    !active && 'border-dashed border-border/60',
    isSelected && 'border-border bg-muted/40',
  )
}

function subclassRowTitleClass(active: boolean) {
  return cn('block truncate font-medium', !active && 'text-muted-foreground')
}

function SubclassListRowBadges({
  source,
  isModified,
  active,
}: {
  source: SubclassListItem['source']
  isModified: boolean
  active: boolean
}) {
  const { variant, label } = SOURCE_BADGE[source]

  return (
    <span className="mt-1 flex flex-wrap gap-1">
      <Badge variant={variant} className="text-[10px]">
        {label}
      </Badge>
      {isModified ? (
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
  )
}

function SubclassListRowDeleteControl({
  item,
  onDeleteRequest,
}: {
  item: SubclassListItem
  onDeleteRequest: (id: string) => void
}) {
  const deletable = isSubclassDeletable(
    item.source === 'unsaved' ? 'homebrew' : item.source,
    item.id,
  )
  if (!deletable) return null

  return (
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
  )
}

interface SubclassListRowProps {
  item: SubclassListItem
  isSelected: boolean
  active: boolean
  isModified: boolean
  onSelect: (id: string) => void
  onDeleteRequest: (id: string) => void
}

function SubclassListRow({
  item,
  isSelected,
  active,
  isModified,
  onSelect,
  onDeleteRequest,
}: SubclassListRowProps) {
  return (
    <li>
      <div className={subclassRowShellClass(isSelected, active)}>
        <button
          type="button"
          aria-current={isSelected ? 'true' : undefined}
          onClick={() => onSelect(item.id)}
          className="min-w-0 flex-1 rounded-md px-3 py-2 text-left text-sm hover:bg-muted/60"
        >
          <span className={subclassRowTitleClass(active)}>
            {item.name || UNTITLED_SUBCLASS_LABEL}
          </span>
          <SubclassListRowBadges source={item.source} isModified={isModified} active={active} />
        </button>
        <SubclassListRowDeleteControl item={item} onDeleteRequest={onDeleteRequest} />
      </div>
    </li>
  )
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
          {items.map((item) => (
            <SubclassListRow
              key={item.id}
              item={item}
              isSelected={item.id === selectedId}
              active={isSubclassActive(activeById, item.id)}
              isModified={modifiedIds.has(item.id)}
              onSelect={onSelect}
              onDeleteRequest={onDeleteRequest}
            />
          ))}
        </ul>
      )}
    </nav>
  )
}
