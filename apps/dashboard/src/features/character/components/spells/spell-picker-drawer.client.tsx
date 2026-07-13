'use client'

import {
  Badge,
  Button,
  CatalogPickerSheet,
  Heading,
  PreviewCard,
  RichTextContent,
  Text,
  cn,
} from '@rpg/ui'
import { formatSpellPickerComponents } from '@rpg/contracts'

import {
  collectSpellPickerMarkers,
  formatSpellPickerDrawerDescription,
  formatSpellPickerDrawerTitle,
  getSpellPickerDisabledNote,
  isSpellPickerRowDimmed,
  resolveSpellPickerEmptyStateKind,
  resolveSpellPickerEmptyStateMessage,
  splitSpellDescriptionHtml,
} from './spell-picker-drawer.lib'
import {
  SPELL_PICKER_NO_OPTIONS_MESSAGE,
  SPELL_PICKER_NO_RESULTS_MESSAGE,
  type SpellPickerDrawerProps,
  type SpellPickerItem,
} from './spell-picker-drawer.types'
import {
  spellPickerDetailsClasses,
  spellPickerDisabledRowClasses,
  spellPickerEmptyStateClasses,
  spellPickerMarkerRowClasses,
} from './spell-picker-drawer.variants'

export type { SpellPickerDrawerProps } from './spell-picker-drawer.types'

function SpellPickerMarkers({ item }: { item: SpellPickerItem }) {
  const markers = collectSpellPickerMarkers(item.spell)
  if (markers.length === 0) return null

  return (
    <div className={spellPickerMarkerRowClasses}>
      {markers.map((marker) => (
        <Badge key={marker} appearance="outline" tone="neutral" size="sm">
          {marker}
        </Badge>
      ))}
    </div>
  )
}

function SpellPickerRow({
  item,
  onAdd,
  onRemove,
}: {
  item: SpellPickerItem
  onAdd: () => void
  onRemove: () => void
}) {
  const dimmed = isSpellPickerRowDimmed(item)
  const disabledNote = getSpellPickerDisabledNote(item)
  const selected = item.state.isAlreadySelected

  return (
    <div className={cn(dimmed ? spellPickerDisabledRowClasses : undefined)}>
      <PreviewCard
        title={item.spell.name}
        description={item.summaryLine}
        tone={selected ? 'selected' : 'transparent'}
        density="compact"
        footerSlot={
          <>
            <SpellPickerMarkers item={item} />
            {disabledNote ? <Text variant="muted">{disabledNote}</Text> : null}
          </>
        }
        endSlot={
          selected ? (
            <Button type="button" size="sm" variant="outline" onClick={onRemove}>
              Remove
            </Button>
          ) : (
            <Button type="button" size="sm" disabled={!item.state.canSelect} onClick={onAdd}>
              Add
            </Button>
          )
        }
      />
    </div>
  )
}

function SpellPickerDetails({ item }: { item: SpellPickerItem }) {
  const { mainHtml, higherLevelHtml } = splitSpellDescriptionHtml(item.spell.description ?? '')
  const components = formatSpellPickerComponents(item.spell.components)

  return (
    <div className={spellPickerDetailsClasses}>
      {mainHtml ? <RichTextContent html={mainHtml} size="sm" tone="muted" /> : null}
      {higherLevelHtml ? (
        <>
          <Heading as="h4" variant="section">
            At higher levels
          </Heading>
          <RichTextContent html={higherLevelHtml} size="sm" tone="muted" />
        </>
      ) : null}
      {components ? <Text variant="muted">Components: {components}</Text> : null}
    </div>
  )
}

/** Spell catalog drawer — thin wrapper over `CatalogPickerSheet`. */
export function SpellPickerDrawer({
  open,
  onOpenChange,
  choiceSet,
  selectedIds,
  items,
  onSelectSpell,
  onRemoveSpell,
}: SpellPickerDrawerProps) {
  const emptyStateKind = resolveSpellPickerEmptyStateKind(items.length, choiceSet, selectedIds)
  const emptyStateMessage = resolveSpellPickerEmptyStateMessage(emptyStateKind)

  return (
    <CatalogPickerSheet
      open={open}
      onOpenChange={onOpenChange}
      title={formatSpellPickerDrawerTitle(choiceSet)}
      description={formatSpellPickerDrawerDescription(choiceSet, selectedIds)}
      items={items}
      getItemKey={(item) => item.spell.id}
      getSearchText={(item) => item.searchText}
      searchPlaceholder="Search spells"
      noResultsMessage={SPELL_PICKER_NO_RESULTS_MESSAGE}
      noItemsMessage={SPELL_PICKER_NO_OPTIONS_MESSAGE}
      emptyState={
        emptyStateMessage ? (
          <div className={spellPickerEmptyStateClasses} role="status">
            {emptyStateMessage}
          </div>
        ) : undefined
      }
      renderItem={(item) => (
        <SpellPickerRow
          item={item}
          onAdd={() => onSelectSpell(item.spell.id)}
          onRemove={() => onRemoveSpell(item.spell.id)}
        />
      )}
      renderItemDetails={(item) => <SpellPickerDetails item={item} />}
    />
  )
}
