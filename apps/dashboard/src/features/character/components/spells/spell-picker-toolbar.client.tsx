'use client'

import { CatalogFilterChips, FilterToolbar, type FilterFieldConfig } from '@rpg/ui'

import { CatalogFilterPopover } from '../picker/catalog-filter-popover.client'
import { CatalogSortControl } from '../picker/catalog-sort-control.client'
import { pickerSortOption } from '../picker/catalog-picker-sort-labels.lib'
import {
  formatSpellPickerLevelChipLabel,
  formatSpellPickerMechanicsTriggerLabel,
  getSpellPickerCastingTimeFilterLabel,
  getSpellPickerMethodFilterLabel,
  getSpellPickerTraitFilterLabel,
} from './spell-picker-drawer.lib'
import {
  SPELL_PICKER_LEVELS_ALL,
  SPELL_PICKER_SORT_LABEL,
  SPELL_PICKER_SORT_LABELS,
  type SpellPickerBrowseState,
  type SpellPickerCastingTimeFilter,
  type SpellPickerMethodFilter,
  type SpellPickerSortMode,
  type SpellPickerTraitFilter,
} from './spell-picker-drawer.types'

type SpellPickerLevelControlsProps = {
  showLevelChips: boolean
  levelOptions: readonly number[]
  selectedLevelValues: string[]
  onSelectedLevelsChange: (values: string[]) => void
}

export function SpellPickerLevelControls({
  showLevelChips,
  levelOptions,
  selectedLevelValues,
  onSelectedLevelsChange,
}: SpellPickerLevelControlsProps) {
  if (!showLevelChips) return null

  return (
    <CatalogFilterChips
      id="spell-picker-levels"
      label="Levels"
      selectionMode="multiple"
      options={[
        { value: SPELL_PICKER_LEVELS_ALL, label: 'All' },
        ...levelOptions.map((level) => ({
          value: String(level),
          label: formatSpellPickerLevelChipLabel(level),
        })),
      ]}
      selectedValues={selectedLevelValues}
      onSelectedValuesChange={onSelectedLevelsChange}
    />
  )
}

type SpellPickerFilterControlsProps = {
  showSchoolFilter: boolean
  schoolFilterFields: FilterFieldConfig<{
    selectedSchool: SpellPickerBrowseState['selectedSchool']
  }>[]
  browseState: SpellPickerBrowseState
  onBrowseStateChange: (next: SpellPickerBrowseState) => void
  castingTimeOptions: readonly SpellPickerCastingTimeFilter[]
  traitOptions: readonly SpellPickerTraitFilter[]
  methodOptions: readonly SpellPickerMethodFilter[]
}

export function SpellPickerFilterControls({
  showSchoolFilter,
  schoolFilterFields,
  browseState,
  onBrowseStateChange,
  castingTimeOptions,
  traitOptions,
  methodOptions,
}: SpellPickerFilterControlsProps) {
  return (
    <>
      {showSchoolFilter ? (
        <FilterToolbar
          idPrefix="spell-picker-school"
          fields={schoolFilterFields}
          values={{ selectedSchool: browseState.selectedSchool }}
          className="flex-row flex-nowrap items-center gap-0"
          onValueChange={(_key, value) => {
            if (value !== undefined) {
              onBrowseStateChange({
                ...browseState,
                selectedSchool: value as typeof browseState.selectedSchool,
              })
            }
          }}
        />
      ) : null}

      {castingTimeOptions.length > 0 || traitOptions.length > 0 || methodOptions.length > 0 ? (
        <CatalogFilterPopover
          triggerLabel={formatSpellPickerMechanicsTriggerLabel(
            browseState.mechanicsFilters.castingTimes.length +
              browseState.mechanicsFilters.traits.length +
              browseState.mechanicsFilters.methods.length,
          )}
          triggerAriaLabel="Casting and mechanics filters"
          groups={[
            castingTimeOptions.length > 0
              ? {
                  id: 'casting-time',
                  label: 'Casting time',
                  options: castingTimeOptions.map((filter) => ({
                    value: filter,
                    label: getSpellPickerCastingTimeFilterLabel(filter),
                  })),
                  selectedValues: browseState.mechanicsFilters.castingTimes,
                  onSelectedValuesChange: (castingTimes: string[]) =>
                    onBrowseStateChange({
                      ...browseState,
                      mechanicsFilters: {
                        ...browseState.mechanicsFilters,
                        castingTimes:
                          castingTimes as typeof browseState.mechanicsFilters.castingTimes,
                      },
                    }),
                }
              : null,
            traitOptions.length > 0
              ? {
                  id: 'traits',
                  label: 'Traits',
                  options: traitOptions.map((filter) => ({
                    value: filter,
                    label: getSpellPickerTraitFilterLabel(filter),
                  })),
                  selectedValues: browseState.mechanicsFilters.traits,
                  onSelectedValuesChange: (traits: string[]) =>
                    onBrowseStateChange({
                      ...browseState,
                      mechanicsFilters: {
                        ...browseState.mechanicsFilters,
                        traits: traits as typeof browseState.mechanicsFilters.traits,
                      },
                    }),
                }
              : null,
            methodOptions.length > 0
              ? {
                  id: 'method',
                  label: 'Method',
                  options: methodOptions.map((filter) => ({
                    value: filter,
                    label: getSpellPickerMethodFilterLabel(filter),
                  })),
                  selectedValues: browseState.mechanicsFilters.methods,
                  onSelectedValuesChange: (methods: string[]) =>
                    onBrowseStateChange({
                      ...browseState,
                      mechanicsFilters: {
                        ...browseState.mechanicsFilters,
                        methods: methods as typeof browseState.mechanicsFilters.methods,
                      },
                    }),
                }
              : null,
          ].filter((group): group is NonNullable<typeof group> => group !== null)}
        />
      ) : null}
    </>
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
  return (
    <CatalogSortControl
      value={sortMode}
      label={SPELL_PICKER_SORT_LABEL}
      ariaLabel="Sort spells"
      triggerAriaLabel="Spell sort order"
      options={validSortModes.map((mode) => pickerSortOption(mode, SPELL_PICKER_SORT_LABELS[mode]))}
      onValueChange={onSortModeChange}
    />
  )
}
