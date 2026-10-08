import * as React from 'react'

import { Button, Text } from '@rpg/ui'

import {
  CatalogEntityPickerSheet,
  CatalogEntitySurfaceRow,
  RelationshipCatalogFilterBand,
  createCharacterRelationshipFilterSchema,
  relationshipCatalogFilterHasBand,
  resolveCharacterRelationshipFilterLayout,
  useRelationshipCatalogFilters,
} from '@/features/content'

import { resolvePickerSelectionStateLine } from '../../../lib/picker/picker-selection-state'
import { formatContentReferenceLabel } from '../../../lib/display/format-content-reference-label'
import { buildCharacterEntityCardModel } from '../../../lib/display/character-entity-summary.lib'
import { hasCatalogPickerResetViewCriteria } from '../../picker/catalog-picker-filter-state.lib'
import { CatalogToolbarResetSlot } from '../../picker/catalog-toolbar-reset-action'
import {
  buildCharacterPickerOptionEntitySummary,
  buildCharacterPickerOptionSearchText,
} from '../../../lib/picker/character-picker-option.lib'
import {
  CHARACTER_PICKER_SEARCH_PLACEHOLDER,
  type CharacterPickerDrawerProps,
} from './character-picker-drawer.types'

export type { CharacterPickerDrawerProps } from './character-picker-drawer.types'

const CHARACTER_PICKER_SUBMIT_FAILED_MESSAGE = 'Could not add this character connection.'

export function CharacterPickerDrawer({
  open,
  onOpenChange,
  title = 'Add person',
  items,
  resolveClassLabel = formatContentReferenceLabel,
  onSelect,
  closeOnSelect = true,
}: CharacterPickerDrawerProps) {
  const [pending, setPending] = React.useState(false)
  const [submitError, setSubmitError] = React.useState<string | null>(null)
  const characterFilterSchema = React.useMemo(
    () =>
      createCharacterRelationshipFilterSchema({
        rows: items,
        getCharacterType: (item) => item.character.characterType,
        getClassIds: (item) => item.character.classIds,
        resolveClassLabel,
      }),
    [items, resolveClassLabel],
  )
  const characterFilterLayout = React.useMemo(
    () => resolveCharacterRelationshipFilterLayout(characterFilterSchema),
    [characterFilterSchema],
  )
  const characterFilters = useRelationshipCatalogFilters({
    rows: items,
    schema: characterFilterSchema,
  })
  const showTypeFilter = relationshipCatalogFilterHasBand(
    'primary',
    characterFilterSchema,
    characterFilterLayout,
  )
  const showClassFilter = relationshipCatalogFilterHasBand(
    'filterRow',
    characterFilterSchema,
    characterFilterLayout,
  )

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      if (pending) return
      if (!nextOpen) {
        characterFilters.reset()
        setSubmitError(null)
      }
      onOpenChange(nextOpen)
    },
    [characterFilters.reset, onOpenChange, pending],
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
      items={characterFilters.filteredRows}
      hasStructuredFilters={characterFilters.structuredFilterCount > 0}
      primaryControls={
        showTypeFilter ? (
          <RelationshipCatalogFilterBand
            band="primary"
            schema={characterFilterSchema}
            layout={characterFilterLayout}
            state={characterFilters.state}
            data={items}
            idPrefix="character-picker"
            onValueChange={characterFilters.setValue}
          />
        ) : undefined
      }
      filterRow={
        showClassFilter
          ? {
              controls: (
                <RelationshipCatalogFilterBand
                  band="filterRow"
                  schema={characterFilterSchema}
                  layout={characterFilterLayout}
                  state={characterFilters.state}
                  data={items}
                  idPrefix="character-picker"
                  onValueChange={characterFilters.setValue}
                />
              ),
            }
          : undefined
      }
      actions={({ searchQuery, resetSearchQuery }) => {
        const showReset = hasCatalogPickerResetViewCriteria({
          structuredFilterCount: characterFilters.structuredFilterCount,
          searchQuery,
        })
        if (!showReset) return null

        return (
          <CatalogToolbarResetSlot
            visible
            includesSort={false}
            onClick={() => {
              characterFilters.reset()
              resetSearchQuery()
            }}
          />
        )
      }}
      getItemKey={({ character }) => character.id}
      getItemToolbarLabel={({ character }) => character.name}
      getSearchText={({ character }) => buildCharacterPickerOptionSearchText(character)}
      searchPlaceholder={CHARACTER_PICKER_SEARCH_PLACEHOLDER}
      noResultsMessage="No characters match your search."
      noItemsMessage="No campaign characters are available."
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
                ...(selected
                  ? { selectionState: resolvePickerSelectionStateLine({ kind: 'selected' }) }
                  : {}),
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
