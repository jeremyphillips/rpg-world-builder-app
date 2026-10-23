'use client'

import { cn } from '../../../lib/utils'
import { SharedFilterSelect } from '../../../filters/shared-filter-select.client'
import type { ComboboxFilterDimensionConfig } from '../../field-config'
import {
  dimensionValueToSelectValue,
  resolveComboboxDimensionAllOptionLabel,
  selectValueToDimensionValue,
} from './combobox-field-form.lib'
import type { ActiveDimensionFilters } from '../../field-config'

export interface ComboboxFilterToolbarProps {
  dimensionConfigs: readonly ComboboxFilterDimensionConfig[]
  active: ActiveDimensionFilters
  onActiveChange: (next: ActiveDimensionFilters) => void
}

/** Multi-dimension combobox panel filter row. */
export function ComboboxFilterToolbar({
  dimensionConfigs,
  active,
  onActiveChange,
}: ComboboxFilterToolbarProps) {
  if (dimensionConfigs.length === 0) return null

  return (
    <div className={cn('ui-catalog-filter-controls w-full')}>
      {dimensionConfigs.map((config) => {
        const dimensionValue = active[config.filterKey]
        return (
          <div key={config.filterKey} className="ui-combobox-filter-toolbar__item">
            <SharedFilterSelect
              ariaLabel={config.ariaLabel}
              options={config.options}
              selectValue={dimensionValueToSelectValue(dimensionValue)}
              allOptionLabel={resolveComboboxDimensionAllOptionLabel(config)}
              onSelectValueChange={(wireValue) => {
                onActiveChange({
                  ...active,
                  [config.filterKey]: selectValueToDimensionValue(wireValue),
                })
              }}
            />
          </div>
        )
      })}
    </div>
  )
}
