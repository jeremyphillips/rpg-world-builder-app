export type {
  BooleanFilterFieldDef,
  ChipsFilterFieldDef,
  ChipsSelectionMode,
  FilterCatalogLayoutConfig,
  FilterChangeContext,
  FilterDensity,
  FilterFieldDef,
  FilterFieldId,
  FilterFieldOptionsContext,
  FilterFieldWidth,
  FilterMatchFn,
  FilterOption,
  FilterPlacement,
  FilterSanitizeContext,
  FilterSchema,
  FilterValueEquality,
  FilterValuePredicate,
  PopoverFilterFieldDef,
  PopoverGroupDef,
  SelectFilterFieldDef,
  SelectFilterLayout,
  TextFilterFieldDef,
} from './filter-schema.types'

export { createFilterSchema } from './filter-schema.types'

export {
  applyFilterSchema,
  countModifiedFilters,
  createInitialFilterState,
  getEffectiveFilterValue,
  isFilterConstraining,
  isFilterModified,
  resetFilterState,
  resolveFilterFieldPlacement,
  sanitizeFilterState,
  setFilterValue,
} from './filter-engine'

export {
  createBooleanFilter,
  createChipsFilter,
  createEqualsFilter,
  createPopoverFilter,
  createTextFilter,
  isPopoverFiltersConstraining,
  normalizeTextFilterValue,
  popoverFiltersEqual,
  shallowArrayEqual,
} from './filter-engine.helpers'

export { FILTER_DENSITY_DEFAULT, FILTER_SELECT_ALL_VALUE } from './filter-bar.variants'
export {
  getSchemaFieldsByPlacement,
  isFilterFieldDisabled,
  isFilterFieldVisible,
  normalizeFilterSelectChange,
  resolveFilterControlSize,
  resolveFilterSelectValue,
} from './filter-bar.lib'

export { FilterBar, type FilterBarProps } from './filter-bar.client'
export { FilterAdvancedPanel, type FilterAdvancedPanelProps } from './filter-advanced-panel.client'
export { FilterField, FilterFieldList } from './filter-fields.client'
export {
  CatalogFilterControls,
  type CatalogFilterControlsProps,
} from './catalog-filter-controls.client'
export { CatalogFilterField, CatalogFilterFieldList } from './catalog-filter-fields.client'
export { useFilterState, type UseFilterStateOptions } from './use-filter-state.client'

export type { FilterSearchParamsInput } from './filter-persistence'
export {
  hydrateFilterState,
  parseFilterSearchParams,
  serializeFilterSearchParams,
} from './filter-persistence'
