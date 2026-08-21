import type { SpellPickerItem } from '@rpg/contracts'
import { getSpellSchoolLabel } from '@rpg/contracts'

import {
  applyFilterSchema,
  countModifiedFilters,
  createChipsFilter,
  createEqualsFilter,
  createFilterSchema,
  createPopoverFilter,
  shallowArrayEqual,
  popoverFiltersEqual,
  type FilterCatalogLayoutConfig,
  type FilterSchema,
} from '@rpg/ui/filters'

import type { SpellDisplayVocabulary } from '@/features/content'

import {
  formatSpellPickerLevelChipLabel,
  formatSpellPickerMechanicsTriggerLabel,
  getSpellPickerCastingTimeFilterLabel,
  getSpellPickerMethodFilterLabel,
  getSpellPickerTraitFilterLabel,
  matchesSpellPickerMechanicsFilters,
  resolveSpellPickerLevelChipChange,
  resolveSpellPickerCastingTimeFilterOptions,
  resolveSpellPickerMethodFilterOptions,
  resolveSpellPickerTraitFilterOptions,
} from './spell-picker-drawer.lib'
import {
  SPELL_PICKER_LEVELS_ALL,
  SPELL_PICKER_LEVELS_LABEL,
  SPELL_PICKER_MODE_CANTRIPS,
  SPELL_PICKER_MODE_PREPARED_SPELLS,
  SPELL_PICKER_SCHOOL_ALL,
  SPELL_PICKER_SCHOOL_LABEL,
  type SpellPickerCastingTimeFilter,
  type SpellPickerMechanicsFilters,
  type SpellPickerMethodFilter,
  type SpellPickerMode,
  type SpellPickerSchoolFilter,
  type SpellPickerTraitFilter,
} from './spell-picker-drawer.types'

export type SpellPickerFilterState = {
  selectedLevels?: number[]
  selectedSchool?: SpellPickerSchoolFilter
  mechanicsFilters?: SpellPickerMechanicsFilters
}

export const SPELL_PICKER_FILTER_LAYOUT = {
  primaryFieldIds: ['selectedLevels'],
  filterRowFieldIds: ['selectedSchool', 'mechanicsFilters'],
} as const satisfies FilterCatalogLayoutConfig<SpellPickerFilterState>

const DEFAULT_MECHANICS_FILTERS: SpellPickerMechanicsFilters = {
  castingTimes: [],
  traits: [],
  methods: [],
}

export type CreateSpellPickerFilterSchemaArgs = {
  mode: SpellPickerMode
  items: readonly SpellPickerItem[]
  displayVocabulary?: SpellDisplayVocabulary
  showLevelChips: boolean
  showSchoolFilter: boolean
  castingTimeOptions: readonly SpellPickerCastingTimeFilter[]
  traitOptions: readonly SpellPickerTraitFilter[]
  methodOptions: readonly SpellPickerMethodFilter[]
  levelOptions: readonly number[]
}

function sanitizeSpellPickerLevelSelection(
  args: CreateSpellPickerFilterSchemaArgs,
  state: SpellPickerFilterState,
): Partial<SpellPickerFilterState> {
  const selectedLevels =
    args.mode === SPELL_PICKER_MODE_CANTRIPS ? [] : (state.selectedLevels ?? [])

  if (shallowArrayEqual(selectedLevels, state.selectedLevels ?? [])) {
    return {}
  }

  return { selectedLevels }
}

function sanitizeSpellPickerMechanicsSelection(
  args: CreateSpellPickerFilterSchemaArgs,
  state: SpellPickerFilterState,
): Partial<SpellPickerFilterState> {
  const mechanicsFilters = {
    ...DEFAULT_MECHANICS_FILTERS,
    ...state.mechanicsFilters,
    castingTimes: (state.mechanicsFilters?.castingTimes ?? []).filter((entry) =>
      args.castingTimeOptions.includes(entry),
    ),
    traits: (state.mechanicsFilters?.traits ?? []).filter((entry) =>
      args.traitOptions.includes(entry),
    ),
    methods: (state.mechanicsFilters?.methods ?? []).filter((entry) =>
      args.methodOptions.includes(entry),
    ),
  }

  if (popoverFiltersEqual(mechanicsFilters, state.mechanicsFilters ?? DEFAULT_MECHANICS_FILTERS)) {
    return {}
  }

  return { mechanicsFilters }
}

function sanitizeSpellPickerFilterState(
  args: CreateSpellPickerFilterSchemaArgs,
  state: SpellPickerFilterState,
): Partial<SpellPickerFilterState> {
  return {
    ...sanitizeSpellPickerLevelSelection(args, state),
    ...sanitizeSpellPickerMechanicsSelection(args, state),
  }
}

export function createSpellPickerFilterSchema(
  args: CreateSpellPickerFilterSchemaArgs,
): FilterSchema<SpellPickerItem, SpellPickerFilterState> {
  const fields = []

  if (args.showLevelChips) {
    fields.push(
      createChipsFilter<SpellPickerItem, SpellPickerFilterState, 'selectedLevels'>({
        id: 'selectedLevels',
        label: SPELL_PICKER_LEVELS_LABEL,
        selectionMode: 'multiple',
        allValue: SPELL_PICKER_LEVELS_ALL,
        defaultValue: [],
        isValueConstraining: (value) => Array.isArray(value) && value.length > 0,
        isValueEqual: shallowArrayEqual,
        toChipValues: (value) =>
          !value || value.length === 0 ? [SPELL_PICKER_LEVELS_ALL] : value.map(String),
        fromChipValues: (current, next, _ctx) =>
          resolveSpellPickerLevelChipChange(current ?? [], next, args.levelOptions),
        options: () => [
          { value: SPELL_PICKER_LEVELS_ALL, label: 'All' },
          ...args.levelOptions.map((level) => ({
            value: String(level),
            label: formatSpellPickerLevelChipLabel(level),
          })),
        ],
        matches: (row, value) => {
          if (!Array.isArray(value) || value.length === 0) return true
          return value.includes(row.spell.level)
        },
      }),
    )
  }

  if (args.showSchoolFilter) {
    fields.push(
      createEqualsFilter<SpellPickerItem, SpellPickerFilterState, 'selectedSchool', string>({
        id: 'selectedSchool',
        label: SPELL_PICKER_SCHOOL_LABEL,
        defaultValue: SPELL_PICKER_SCHOOL_ALL,
        layout: 'inline',
        showAllOption: false,
        ariaLabel: 'Filter by school',
        triggerAriaLabel: 'Spell school',
        options: [
          { value: SPELL_PICKER_SCHOOL_ALL, label: 'All' },
          ...[...new Set(args.items.map((item) => item.spell.school))]
            .sort((left, right) =>
              getSpellSchoolLabel(left).localeCompare(getSpellSchoolLabel(right)),
            )
            .map((school) => ({
              value: school,
              label:
                args.displayVocabulary?.resolveSpellSchoolLabel?.(school) ??
                getSpellSchoolLabel(school),
            })),
        ],
        getValue: (row) => row.spell.school,
        isValueConstraining: (value) => value !== SPELL_PICKER_SCHOOL_ALL,
      }),
    )
  }

  if (
    args.castingTimeOptions.length > 0 ||
    args.traitOptions.length > 0 ||
    args.methodOptions.length > 0
  ) {
    fields.push(
      createPopoverFilter<SpellPickerItem, SpellPickerFilterState, 'mechanicsFilters'>({
        id: 'mechanicsFilters',
        label: 'Casting & mechanics',
        defaultValue: DEFAULT_MECHANICS_FILTERS,
        triggerLabel: formatSpellPickerMechanicsTriggerLabel,
        triggerAriaLabel: 'Casting and mechanics filters',
        groups: () =>
          [
            args.castingTimeOptions.length > 0
              ? {
                  id: 'castingTimes',
                  label: 'Casting time',
                  options: args.castingTimeOptions.map((filter) => ({
                    value: filter,
                    label: getSpellPickerCastingTimeFilterLabel(filter),
                  })),
                }
              : null,
            args.traitOptions.length > 0
              ? {
                  id: 'traits',
                  label: 'Traits',
                  options: args.traitOptions.map((filter) => ({
                    value: filter,
                    label: getSpellPickerTraitFilterLabel(filter),
                  })),
                }
              : null,
            args.methodOptions.length > 0
              ? {
                  id: 'method',
                  label: 'Method',
                  options: args.methodOptions.map((filter) => ({
                    value: filter,
                    label: getSpellPickerMethodFilterLabel(filter),
                  })),
                }
              : null,
          ].filter((group): group is NonNullable<typeof group> => group !== null),
        matches: (row, value) =>
          matchesSpellPickerMechanicsFilters(
            row.spell,
            (value as SpellPickerMechanicsFilters | undefined) ?? DEFAULT_MECHANICS_FILTERS,
          ),
      }),
    )
  }

  return createFilterSchema(fields, {
    sanitizeState: (state) => sanitizeSpellPickerFilterState(args, state),
  })
}

export function extractSpellPickerFilterState(
  browseState: SpellPickerFilterState,
): SpellPickerFilterState {
  return {
    selectedLevels: browseState.selectedLevels,
    selectedSchool: browseState.selectedSchool,
    mechanicsFilters: browseState.mechanicsFilters,
  }
}

export function applySpellPickerFilterSchema(
  schema: FilterSchema<SpellPickerItem, SpellPickerFilterState>,
  state: SpellPickerFilterState,
  items: readonly SpellPickerItem[],
  mode: SpellPickerMode,
): SpellPickerItem[] {
  const filtered = applyFilterSchema(schema, state, [...items])
  if (mode === SPELL_PICKER_MODE_CANTRIPS) {
    return filtered.filter((item) => item.spell.level === 0)
  }
  if (mode === SPELL_PICKER_MODE_PREPARED_SPELLS) {
    return filtered.filter((item) => item.spell.level >= 1)
  }
  return filtered
}

export function countSpellPickerStructuredFilters(
  schema: FilterSchema<SpellPickerItem, SpellPickerFilterState>,
  state: SpellPickerFilterState,
): number {
  return countModifiedFilters(schema, state)
}

export function resolveSpellPickerFilterOptions(items: readonly SpellPickerItem[]) {
  return {
    levelOptions: [
      ...new Set(items.map((item) => item.spell.level).filter((level) => level >= 1)),
    ].sort((left, right) => left - right),
    schoolOptions: [...new Set(items.map((item) => item.spell.school))],
    castingTimeOptions: resolveSpellPickerCastingTimeFilterOptions(items),
    traitOptions: resolveSpellPickerTraitFilterOptions(items),
    methodOptions: resolveSpellPickerMethodFilterOptions(items),
  }
}
