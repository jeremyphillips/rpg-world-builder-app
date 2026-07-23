import { cn, Badge, Button, Text } from '@rpg/ui'
import { Trash2 } from 'lucide-react'

import {
  isSubclassDeletable,
  UNTITLED_SUBCLASS_LABEL,
} from '../lib/subclasses/subclass-editor-constants'
import type { SubclassListItem } from '../lib/subclasses/subclass-editor-state'

export interface SubclassListPanelProps {
  items: SubclassListItem[]
  selectedId: string | null
  modifiedIds: ReadonlySet<string>
  onSelect: (id: string) => void
  onAdd: () => void
  onDeleteRequest: (id: string) => void
}

const SOURCE_BADGE = {
  system: { appearance: 'neutral', tone: 'neutral', label: 'System' },
  homebrew: { appearance: 'outline', tone: 'neutral', label: 'Homebrew' },
  unsaved: { appearance: 'outline', tone: 'neutral', label: 'Unsaved' },
} as const satisfies Record<
  SubclassListItem['source'],
  { appearance: 'neutral' | 'outline'; tone: 'neutral'; label: string }
>

function subclassRowShellClass(isSelected: boolean) {
  return cn(
    'flex items-center gap-1 rounded-md border border-transparent',
    isSelected && 'border-row-selected-border bg-row-selected',
  )
}

function SubclassListRowBadges({
  source,
  isModified,
}: {
  source: SubclassListItem['source']
  isModified: boolean
}) {
  const { appearance, tone, label } = SOURCE_BADGE[source]

  return (
    <span className="mt-1 flex flex-wrap gap-1">
      <Badge appearance={appearance} tone={tone} size="sm">
        {label}
      </Badge>
      {isModified ? (
        <Badge appearance="outline" tone="neutral" size="sm">
          Modified
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
  isModified: boolean
  onSelect: (id: string) => void
  onDeleteRequest: (id: string) => void
}

function SubclassListRow({
  item,
  isSelected,
  isModified,
  onSelect,
  onDeleteRequest,
}: SubclassListRowProps) {
  return (
    <li>
      <div className={subclassRowShellClass(isSelected)}>
        <button
          type="button"
          aria-current={isSelected ? 'true' : undefined}
          onClick={() => onSelect(item.id)}
          className="min-w-0 flex-1 rounded-md px-3 py-2 text-left text-sm hover:bg-row-hover"
        >
          <span className="block truncate font-medium">{item.name || UNTITLED_SUBCLASS_LABEL}</span>
          <SubclassListRowBadges source={item.source} isModified={isModified} />
        </button>
        <SubclassListRowDeleteControl item={item} onDeleteRequest={onDeleteRequest} />
      </div>
    </li>
  )
}

export function SubclassListPanel({
  items,
  selectedId,
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
