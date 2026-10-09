import * as React from 'react'

import {
  CatalogEntityPickerSheet,
  CatalogEntitySurfaceRow,
  RelationshipCatalogFilterBand,
  createCharacterRelationshipFilterSchema,
  relationshipCatalogFilterHasBand,
  resolveCharacterRelationshipFilterLayout,
  useRelationshipCatalogFilters,
} from '@/features/content'

import { resolvePickerPendingLabel } from '../../../lib/picker/picker-mutation-family'
import { resolvePickerSelectionStateLine } from '../../../lib/picker/picker-selection-state'
import { formatContentReferenceLabel } from '../../../lib/display/format-content-reference-label'
import { buildCharacterEntityCardModel } from '../../../lib/display/character-entity-summary.lib'
import { hasCatalogPickerResetViewCriteria } from '../../picker/catalog-picker-filter-state.lib'
import { resolveCatalogPickerResultSummary } from '../../picker/catalog-picker-filter-state.lib'
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

const CHARACTER_PICKER_PENDING_LABEL = resolvePickerPendingLabel('genericSelection', 'acquire')

export function CharacterPickerDrawer({
  open,
  onOpenChange,
  title = 'Add person',
  items,
  resolveClassLabel = formatContentReferenceLabel,
  onSelect,
  closeOnSelect = true,
  rowActionLabel = 'Choose',
  bodyReplacement,
  footer,
}: CharacterPickerDrawerProps) {
  const [pendingId, setPendingId] = React.useState<string | null>(null)
  const [failedId, setFailedId] = React.useState<string | null>(null)
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
      if (pendingId) return
      if (!nextOpen) {
        characterFilters.reset()
        setFailedId(null)
      }
      onOpenChange(nextOpen)
    },
    [characterFilters.reset, onOpenChange, pendingId],
  )

  const commitSelection = React.useCallback(
    async (characterId: string) => {
      if (pendingId) return

      setPendingId(characterId)
      setFailedId(null)
      try {
        await onSelect(characterId)
        if (closeOnSelect) {
          onOpenChange(false)
        }
      } catch {
        setFailedId(characterId)
      } finally {
        setPendingId(null)
      }
    },
    [closeOnSelect, onOpenChange, onSelect, pendingId],
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
      actions={({ searchQuery, resetSearchQuery, visibleItemCount }) => {
        const showReset = hasCatalogPickerResetViewCriteria({
          structuredFilterCount: characterFilters.structuredFilterCount,
          searchQuery,
        })
        return (
          <CatalogToolbarResetSlot
            visible={showReset}
            reserve={showClassFilter}
            includesSort={false}
            {...resolveCatalogPickerResultSummary({
              visible: visibleItemCount,
              total: characterFilters.sourceCount,
            })}
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
                      label: rowActionLabel,
                      pendingLabel: CHARACTER_PICKER_PENDING_LABEL,
                      entityKey: character.id,
                      failed: failedId === character.id,
                      onClick: () => {
                        void commitSelection(character.id)
                      },
                      loading: pendingId === character.id,
                    },
            }}
          />
        )
      }}
      bodyReplacement={bodyReplacement}
      footer={footer}
    />
  )
}
