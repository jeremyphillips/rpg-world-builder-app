import { CatalogFilterControls, setFilterValue } from '@rpg/ui/filters'

import { CatalogSortControl } from '../../picker/sort/catalog-sort-control'
import { useMemo } from 'react'

import {
  SPELL_PICKER_SORT_AXES,
  SPELL_PICKER_SORT_BEST_MATCH,
  SPELL_PICKER_SORT_PRESETS,
  type SpellPickerSortMode,
} from './spell-picker-drawer.types'
import {
  createSpellPickerFilterSchema,
  SPELL_PICKER_FILTER_LAYOUT,
  type SpellPickerFilterState,
} from './spell-picker-filter-schema'
import type { CreateSpellPickerFilterSchemaArgs } from './spell-picker-filter-schema'

type SpellPickerFilterControlsBaseProps = {
  schemaArgs: CreateSpellPickerFilterSchemaArgs
  filterState: SpellPickerFilterState
  onFilterStateChange: (next: SpellPickerFilterState) => void
}

function useSpellPickerFilterControls({
  schemaArgs,
  filterState,
  onFilterStateChange,
}: SpellPickerFilterControlsBaseProps) {
  const schema = useMemo(() => createSpellPickerFilterSchema(schemaArgs), [schemaArgs])

  const handleValueChange = (
    id: keyof SpellPickerFilterState,
    value: SpellPickerFilterState[keyof SpellPickerFilterState] | undefined,
  ) => {
    onFilterStateChange(setFilterValue(schema, filterState, id, value))
  }

  return { schema, handleValueChange }
}

export function SpellPickerPrimaryFilterControls(props: SpellPickerFilterControlsBaseProps) {
  const { schema, handleValueChange } = useSpellPickerFilterControls(props)

  return (
    <CatalogFilterControls.Primary
      schema={schema}
      layout={SPELL_PICKER_FILTER_LAYOUT}
      state={props.filterState}
      data={props.schemaArgs.items}
      idPrefix="spell-picker"
      onValueChange={handleValueChange}
    />
  )
}

export function SpellPickerFilterRowControls(props: SpellPickerFilterControlsBaseProps) {
  const { schema, handleValueChange } = useSpellPickerFilterControls(props)

  return (
    <CatalogFilterControls.FilterRow
      schema={schema}
      layout={SPELL_PICKER_FILTER_LAYOUT}
      state={props.filterState}
      data={props.schemaArgs.items}
      idPrefix="spell-picker"
      onValueChange={handleValueChange}
    />
  )
}

type SpellPickerSortControlProps = {
  sortMode: SpellPickerSortMode
  validSortModes: readonly SpellPickerSortMode[]
  onSortModeChange: (sortMode: SpellPickerSortMode) => void
}

export function SpellPickerSortControl({
  sortMode,
  validSortModes,
  onSortModeChange,
}: SpellPickerSortControlProps) {
  const includeBestMatch = validSortModes.includes(SPELL_PICKER_SORT_BEST_MATCH)

  return (
    <CatalogSortControl
      value={sortMode}
      axes={SPELL_PICKER_SORT_AXES}
      presets={includeBestMatch ? SPELL_PICKER_SORT_PRESETS : undefined}
      availableValues={validSortModes}
      onValueChange={onSortModeChange}
    />
  )
}
