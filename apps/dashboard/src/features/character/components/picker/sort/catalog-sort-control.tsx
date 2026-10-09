import { SortMenu, sortMenuFlatSections, type SortMenuSection } from '@rpg/ui'
import { resolveFilterControlSize, useFilterChrome } from '@rpg/ui/filters'

import type { CatalogPickerSortOption } from './catalog-picker-sort-labels.lib'

export type { CatalogPickerSortOption } from './catalog-picker-sort-labels.lib'

export type CatalogSortControlProps<TMode extends string = string> = {
  /** Accessible context on the trigger; current selection is appended. Default `Sort by`. */
  label?: string
  value: TMode
  options: readonly CatalogPickerSortOption<TMode>[]
  sections?: readonly SortMenuSection<TMode>[]
  onValueChange: (mode: TMode) => void
}

export function CatalogSortControl<TMode extends string = string>({
  label,
  value,
  options,
  sections,
  onValueChange,
}: CatalogSortControlProps<TMode>) {
  const { density } = useFilterChrome()
  const controlSize = resolveFilterControlSize(density)
  const menuSections =
    sections ??
    sortMenuFlatSections(
      options.map((option) => ({
        value: option.value,
        label: option.label,
        triggerLabel: option.triggerLabel,
      })),
    )

  return (
    <SortMenu
      label={label}
      value={value}
      sections={menuSections}
      onValueChange={onValueChange}
      size={controlSize === 'sm' ? 'sm' : 'default'}
      density={density === 'compact' ? 'compact' : 'default'}
    />
  )
}
