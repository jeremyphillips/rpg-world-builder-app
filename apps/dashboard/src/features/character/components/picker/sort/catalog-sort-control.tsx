import { SortMenu, sortMenuFlatSections, type SortMenuSection } from '@rpg/ui'
import { resolveFilterControlSize, useFilterChrome } from '@rpg/ui/filters'

import {
  resolveCatalogSortSections,
  type CatalogSortAxisKey,
  type CatalogSortPresetKey,
} from '@/lib/catalog-sort'

import type { CatalogPickerSortOption } from './catalog-picker-sort-labels.lib'

export type { CatalogPickerSortOption } from './catalog-picker-sort-labels.lib'

type CatalogSortControlSharedProps<TMode extends string> = {
  /** Accessible context on the trigger; current selection is appended. Default `Sort by`. */
  label?: string
  value: TMode
  onValueChange: (mode: TMode) => void
}

export type CatalogSortControlProps<TMode extends string = string> =
  CatalogSortControlSharedProps<TMode> &
    (
      | {
          /** Directional axes from the dashboard catalog-sort registry. */
          axes: readonly CatalogSortAxisKey[]
          /** Named presets (e.g. best_match) rendered ungrouped above axis groups. */
          presets?: readonly CatalogSortPresetKey[]
          /** Optional workflow gate — only these mode values appear. */
          availableValues?: ReadonlySet<string> | readonly string[]
          options?: never
          sections?: never
        }
      | {
          /** Escape hatch: pre-built sections (e.g. tests). */
          sections: readonly SortMenuSection<TMode>[]
          axes?: never
          presets?: never
          availableValues?: never
          options?: never
        }
      | {
          /** Escape hatch: flat options (legacy / tests). */
          options: readonly CatalogPickerSortOption<TMode>[]
          axes?: never
          presets?: never
          availableValues?: never
          sections?: never
        }
    )

/**
 * Catalog sorting control — resolves Greenfield axis/preset copy into SortMenu sections.
 * Does not own sorting pipelines, URL state, or workflow transitions.
 */
export function CatalogSortControl<TMode extends string = string>(
  props: CatalogSortControlProps<TMode>,
) {
  const { label, value, onValueChange } = props
  const { density } = useFilterChrome()
  const controlSize = resolveFilterControlSize(density)
  const sortMenuSize = controlSize === 'sm' ? 'sm' : 'default'

  let menuSections: SortMenuSection<TMode>[]
  if ('axes' in props && props.axes != null) {
    menuSections = resolveCatalogSortSections({
      axes: props.axes,
      presets: props.presets,
      availableValues: props.availableValues,
    }) as SortMenuSection<TMode>[]
  } else if ('sections' in props && props.sections != null) {
    menuSections = [...props.sections]
  } else {
    const options = 'options' in props ? (props.options ?? []) : []
    menuSections = sortMenuFlatSections(
      options.map((option) => ({
        value: option.value,
        label: option.label,
        triggerLabel: option.triggerLabel,
      })),
    )
  }

  return (
    <SortMenu
      label={label}
      value={value}
      sections={menuSections}
      onValueChange={onValueChange}
      size={sortMenuSize}
      density="default"
    />
  )
}
