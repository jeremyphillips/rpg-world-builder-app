import * as React from 'react'

import { RelationshipField } from '@rpg/ui'
import { resolveRelationshipFieldAdapter, type RelationshipFieldRegistry } from '@rpg/ui/form'

import type { CharacterRelationshipFieldContext } from '../../lib/relationship/character-relationship-field-context.types'

export type CharacterControlledRelationshipFieldProps<TEdge> = {
  vocabulary: string
  registry: RelationshipFieldRegistry
  context: CharacterRelationshipFieldContext
  label: string
  emptyLabel: string
  addActionLabel: string
  items: readonly TEdge[]
  disabled?: boolean
  onAdd: (selection: unknown) => void | Promise<void>
  onRemove: (edge: TEdge, index: number) => void
  listAriaLabel?: string
}

/** API-backed relationship field chrome without a surrounding `<Form>`. */
export function CharacterControlledRelationshipField<TEdge>({
  vocabulary,
  registry,
  context,
  label,
  emptyLabel,
  addActionLabel,
  items,
  disabled,
  onAdd,
  onRemove,
  listAriaLabel,
}: CharacterControlledRelationshipFieldProps<TEdge>) {
  const adapter = resolveRelationshipFieldAdapter(registry, vocabulary)
  const [pickerOpen, setPickerOpen] = React.useState(false)
  const itemCount = items.length
  const canAdd = adapter.canAdd?.(items, context) ?? !disabled

  const handleAdd = React.useCallback(
    async (selection: unknown) => {
      await onAdd(selection)
      setPickerOpen(false)
    },
    [onAdd],
  )

  const supplementary = adapter.supplementary?.(context)

  return (
    <RelationshipField
      id={`character-relationship-${vocabulary}`}
      label={label}
      disabled={disabled}
      itemCount={itemCount}
      emptyLabel={emptyLabel}
      addAction={{
        label: addActionLabel,
        onSelect: () => setPickerOpen(true),
        disabled: !canAdd,
      }}
      items={items}
      getItemKey={(edge) => adapter.getItemKey(edge)}
      renderRow={(edge) => {
        const index = items.findIndex(
          (candidate) => adapter.getItemKey(candidate) === adapter.getItemKey(edge),
        )
        const row = adapter.projectRow(edge, context, {
          onRemove: !disabled && index >= 0 ? () => onRemove(edge, index) : undefined,
        })
        return row.content
      }}
      listAriaLabel={listAriaLabel ?? adapter.listAriaLabel ?? label}
      supplementary={supplementary}
      picker={adapter.renderPicker({
        open: pickerOpen,
        onOpenChange: setPickerOpen,
        items,
        onAdd: handleAdd,
        context,
        disabled,
      })}
    />
  )
}
