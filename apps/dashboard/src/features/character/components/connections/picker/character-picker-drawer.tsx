import * as React from 'react'

import { Button, Text } from '@rpg/ui'

import { CatalogEntityPickerSheet, CatalogEntitySurfaceRow } from '@/features/content'

import { buildCharacterEntityCardModel } from '../../../lib/display/character-entity-summary.lib'
import {
  buildCharacterPickerOptionEntitySummary,
  buildCharacterPickerOptionSearchText,
} from '../../../lib/picker/character-picker-option.lib'
import {
  CHARACTER_PICKER_NO_ITEMS_MESSAGE,
  CHARACTER_PICKER_NO_RESULTS_MESSAGE,
  CHARACTER_PICKER_TITLE,
  type CharacterPickerDrawerProps,
} from './character-picker-drawer.types'

export type { CharacterPickerDrawerProps } from './character-picker-drawer.types'

const CHARACTER_PICKER_SUBMIT_FAILED_MESSAGE = 'Could not add this character connection.'

export function CharacterPickerDrawer({
  open,
  onOpenChange,
  title = CHARACTER_PICKER_TITLE,
  items,
  onSelect,
  closeOnSelect = true,
}: CharacterPickerDrawerProps) {
  const [pending, setPending] = React.useState(false)
  const [submitError, setSubmitError] = React.useState<string | null>(null)

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      if (pending) return
      if (!nextOpen) setSubmitError(null)
      onOpenChange(nextOpen)
    },
    [onOpenChange, pending],
  )

  const commitSelection = React.useCallback(
    async (characterId: string) => {
      if (pending) return

      setPending(true)
      setSubmitError(null)
      try {
        await onSelect(characterId)
        if (closeOnSelect) {
          onOpenChange(false)
        }
      } catch (error) {
        const message =
          error instanceof Error && error.message.trim().length > 0
            ? error.message
            : CHARACTER_PICKER_SUBMIT_FAILED_MESSAGE
        setSubmitError(message)
      } finally {
        setPending(false)
      }
    },
    [onOpenChange, onSelect, pending],
  )

  return (
    <CatalogEntityPickerSheet
      open={open}
      onOpenChange={handleOpenChange}
      title={title}
      items={items}
      getItemKey={({ character }) => character.id}
      getItemToolbarLabel={({ character }) => character.name}
      getSearchText={({ character }) => buildCharacterPickerOptionSearchText(character)}
      searchPlaceholder="Search characters"
      noResultsMessage={CHARACTER_PICKER_NO_RESULTS_MESSAGE}
      noItemsMessage={CHARACTER_PICKER_NO_ITEMS_MESSAGE}
      renderEntityRow={(args) => {
        const { character, selected, disabled } = args.item
        const summary = buildCharacterPickerOptionEntitySummary(character)

        return (
          <CatalogEntitySurfaceRow
            toolbarLabel={args.toolbarLabel}
            domIds={args.domIds}
            collapsible={args.collapsible}
            collapsed={args.collapsed}
            onToggleCollapse={args.onToggleCollapse}
            summary={args.summary}
            details={args.details}
            surface={{
              identity: buildCharacterEntityCardModel(summary, {
                includeCharacterTypeInMetadata: true,
                status: selected ? [{ kind: 'badge', label: 'Added', tone: 'success' }] : undefined,
              }),
              inlineAction:
                selected || disabled
                  ? undefined
                  : {
                      label: 'Add',
                      onClick: () => {
                        void commitSelection(character.id)
                      },
                      loading: pending,
                    },
            }}
          />
        )
      }}
      renderItemDetails={({ character, selected, disabled }) => {
        if (selected || disabled) return null

        return (
          <div className="flex flex-col gap-4">
            {submitError ? (
              <Text variant="destructive" role="alert">
                {submitError}
              </Text>
            ) : null}
            <div className="flex justify-end">
              <Button
                type="button"
                disabled={pending}
                onClick={() => {
                  void commitSelection(character.id)
                }}
              >
                Continue
              </Button>
            </div>
          </div>
        )
      }}
    />
  )
}
