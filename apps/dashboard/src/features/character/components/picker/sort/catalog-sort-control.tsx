import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  withFloatingLabelSizingLabel,
} from '@rpg/ui'
import {
  FilterFloatingField,
  resolveFilterChromePresentation,
  useFilterChrome,
} from '@rpg/ui/filters'

import {
  resolvePickerSortTriggerLabel,
  type CatalogPickerSortOption,
} from './catalog-picker-sort-labels.lib'

export type { CatalogPickerSortOption } from './catalog-picker-sort-labels.lib'

export type CatalogSortControlProps<TMode extends string = string> = {
  label?: string
  value: TMode
  options: readonly CatalogPickerSortOption<TMode>[]
  onValueChange: (mode: TMode) => void
}

export function CatalogSortControl<TMode extends string = string>({
  label = 'Sort',
  value,
  options,
  onValueChange,
}: CatalogSortControlProps<TMode>) {
  const chrome = useFilterChrome()
  const presentation = resolveFilterChromePresentation(chrome)
  const selectedOption = options.find((option) => option.value === value)
  const triggerLabel = selectedOption ? resolvePickerSortTriggerLabel(selectedOption) : undefined
  const sizingLabels = withFloatingLabelSizingLabel(label, [
    ...new Set(options.map((option) => resolvePickerSortTriggerLabel(option))),
  ])

  return (
    <Select value={value} onValueChange={(next) => onValueChange(next as TMode)}>
      <FilterFloatingField label={label} populated={value.length > 0} width="auto">
        <SelectTrigger
          size={presentation.controlSize}
          title={triggerLabel}
          sizingLabels={sizingLabels}
        >
          <SelectValue>{triggerLabel}</SelectValue>
        </SelectTrigger>
      </FilterFloatingField>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
