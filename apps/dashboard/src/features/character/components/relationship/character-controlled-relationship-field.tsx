import * as React from 'react'

import { CollectionAddControl, EmptyPanel, fieldArrayItemListClasses, Text } from '@rpg/ui'
import {
  ArrayLikeSectionHeader,
  resolveRelationshipFieldAdapter,
  type RelationshipFieldRegistry,
} from '@rpg/ui/form'

import { CharacterRelationshipEntityCard } from './character-relationship-entity-card'
import type {
  CharacterRelationshipFieldContext,
  CharacterResidenceEdge,
} from '../../lib/relationship/character-relationship-field-context.types'
import {
  resolveOrganizationMembershipPresentation,
  resolveResidencePresentation,
} from '../../lib/relationship/character-relationship-presentation.lib'
import {
  resolveOrganizationMembershipApiTrailing,
  resolveResidenceApiTrailing,
} from '../../lib/relationship/character-relationship-row.lib'
import { resolveResidenceCanAppend } from '../../lib/relationship/character-residence-can-append.lib'
import {
  CHARACTER_ORGANIZATION_MEMBERSHIP_VOCABULARY,
  CHARACTER_RESIDENCE_VOCABULARY,
} from '../../lib/relationship/character-relationship-vocabulary'

type CharacterControlledRelationshipFieldProps<TEdge> = {
  vocabulary: string
  registry: RelationshipFieldRegistry
  context: CharacterRelationshipFieldContext
  label: string
  emptyItemLabel: string
  addActionLabel: string
  items: readonly TEdge[]
  disabled?: boolean
  onAdd: (selection: unknown) => void | Promise<void>
  onRemove: (edge: TEdge, index: number) => void | Promise<void>
}

/** API-backed relationship collection with grant-aligned array chrome. */
export function CharacterControlledRelationshipField<TEdge>({
  vocabulary,
  registry,
  context,
  label,
  emptyItemLabel,
  addActionLabel,
  items,
  disabled,
  onAdd,
  onRemove,
}: CharacterControlledRelationshipFieldProps<TEdge>) {
  const adapter = resolveRelationshipFieldAdapter(registry, vocabulary)
  const [pickerOpen, setPickerOpen] = React.useState(false)
  const [removeError, setRemoveError] = React.useState<string>()
  const itemCount = items.length
  const appendResult =
    vocabulary === CHARACTER_RESIDENCE_VOCABULARY
      ? resolveResidenceCanAppend(items as readonly CharacterResidenceEdge[], context)
      : {
          enabled: (adapter.canAdd?.(items, context) ?? !disabled) && !disabled,
        }
  const supplementary = adapter.supplementary?.(context)

  const handleRemoveAt = React.useCallback(
    async (edge: TEdge, index: number) => {
      if (vocabulary !== CHARACTER_RESIDENCE_VOCABULARY) {
        onRemove(edge, index)
        return
      }
      setRemoveError(undefined)
      try {
        await onRemove(edge, index)
      } catch (error) {
        const message =
          error instanceof Error && error.message.trim().length > 0
            ? error.message
            : 'Could not remove this residence.'
        setRemoveError(message)
      }
    },
    [onRemove, vocabulary],
  )

  const handleAdd = React.useCallback(
    async (selection: unknown) => {
      await onAdd(selection)
      setPickerOpen(false)
    },
    [onAdd],
  )

  const resolvePresentation = (edge: TEdge) => {
    if (vocabulary === CHARACTER_ORGANIZATION_MEMBERSHIP_VOCABULARY) {
      return resolveOrganizationMembershipPresentation(
        edge as Parameters<typeof resolveOrganizationMembershipPresentation>[0],
        context,
      )
    }

    return resolveResidencePresentation(
      edge as Parameters<typeof resolveResidencePresentation>[0],
      context,
    )
  }

  const resolveTrailing = (edge: TEdge, index: number) => {
    if (vocabulary === CHARACTER_ORGANIZATION_MEMBERSHIP_VOCABULARY) {
      return resolveOrganizationMembershipApiTrailing(
        edge as Parameters<typeof resolveOrganizationMembershipApiTrailing>[0],
        context,
        index,
        (membership, removeIndex) => {
          void handleRemoveAt(membership as TEdge, removeIndex)
        },
      )
    }

    return resolveResidenceApiTrailing(
      edge as Parameters<typeof resolveResidenceApiTrailing>[0],
      context,
      index,
      (residence, removeIndex) => {
        void handleRemoveAt(residence as TEdge, removeIndex)
      },
      disabled,
    )
  }

  return (
    <section className="space-y-3" aria-label={label}>
      <ArrayLikeSectionHeader
        wrapper="none"
        label={label}
        action={
          <CollectionAddControl
            label={addActionLabel}
            onClick={() => setPickerOpen(true)}
            enabled={!disabled && appendResult.enabled}
            disabledReason={appendResult.enabled ? undefined : appendResult.reason}
            variant="text"
            size="sm"
          />
        }
      />
      {supplementary}
      {removeError ? (
        <Text variant="destructive" className="text-sm" aria-live="polite">
          {removeError}
        </Text>
      ) : null}
      <div className={fieldArrayItemListClasses({ rhythm: 'compact', size: 'md' })}>
        {itemCount === 0 ? (
          <EmptyPanel>No {emptyItemLabel} added.</EmptyPanel>
        ) : (
          items.map((edge, index) => {
            const presentation = resolvePresentation(edge)
            const trailing = resolveTrailing(edge, index)
            return (
              <CharacterRelationshipEntityCard
                key={adapter.getItemKey(edge)}
                itemId={adapter.getItemKey(edge)}
                heading={presentation.heading}
                classification={presentation.classification}
                status={presentation.status}
                headingHref={presentation.headingHref}
                toolbarAriaLabel={presentation.toolbarAriaLabel}
                trailing={trailing ?? null}
              />
            )
          })
        )}
      </div>
      {adapter.renderPicker({
        open: pickerOpen,
        onOpenChange: setPickerOpen,
        items,
        onAdd: handleAdd,
        context,
        disabled,
      })}
    </section>
  )
}
