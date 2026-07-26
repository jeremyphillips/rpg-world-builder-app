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
  type ApplyFilterSchemaOptions,
  countModifiedFilters,
  createInitialFilterState,
  getEffectiveFilterValue,
  isFilterConstraining,
  isFilterModified,
  resetFilterState,
  resolveFilterFieldPlacement,
  sanitizeFilterState,
  isShallowFilterStateEqual,
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
  resolveFilterSelectValue,
} from './filter-bar.lib'
export {
  mapFilterLayoutToLabelLayout,
  resolveFilterChromePresentation,
  resolveFilterControlSize,
  resolveFilterFieldPresentation,
  resolveFilterFieldWidthClasses,
  type FilterChromePresentation,
  type FilterFieldPresentation,
} from './filter-presentation.lib'

export {
  FilterChromeProvider,
  useFilterChrome,
  useOptionalFilterChrome,
  type FilterChromeContextValue,
} from './filter-chrome.context'
export { FilterBar, type FilterBarProps } from './filter-bar.client'
export {
  FilterAdvancedPanel,
  type FilterAdvancedPanelHeaderProps,
  type FilterAdvancedPanelProps,
} from './filter-advanced-panel.client'
export { FilterFieldRenderer, type FilterRenderContext } from './filter-field-renderer.client'
export { FilterFieldList } from './filter-fields.client'
export { FilterInlineControl, type FilterInlineControlProps } from './filter-inline-control.client'
export {
  CatalogFilterControls,
  type CatalogFilterControlsProps,
} from './catalog-filter-controls.client'
export { CatalogFilterFieldList } from './catalog-filter-fields.client'
export { useFilterState, type UseFilterStateOptions } from './use-filter-state.client'
export {
  useSanitizedFilterState,
  type UseSanitizedFilterStateOptions,
} from './use-sanitized-filter-state.client'

export type { FilterSearchParamsInput } from './filter-persistence'
export {
  hydrateFilterState,
  parseFilterSearchParams,
  serializeFilterSearchParams,
} from './filter-persistence'
export { stableSerializeFilterState } from './filter-state-serialization'
