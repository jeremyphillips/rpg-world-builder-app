import {
  CatalogFilterControls,
  setFilterValue,
  type FilterCatalogLayoutConfig,
  type FilterSchema,
} from '@rpg/ui/filters'

import type { EquipmentPickerFilterState } from './equipment-picker-filter-schema'
import type { EquipmentPickerRow } from '../drawer/equipment-picker-drawer.types'

type EquipmentPickerFilterControlsProps = {
  schema: FilterSchema<EquipmentPickerRow, EquipmentPickerFilterState>
  layout: FilterCatalogLayoutConfig<EquipmentPickerFilterState>
  filterState: EquipmentPickerFilterState
  items: readonly EquipmentPickerRow[]
  onFilterStateChange: (next: EquipmentPickerFilterState) => void
}

function useEquipmentPickerFilterControls({
  schema,
  filterState,
  onFilterStateChange,
}: EquipmentPickerFilterControlsProps) {
  const handleValueChange = (
    id: keyof EquipmentPickerFilterState,
    value: EquipmentPickerFilterState[keyof EquipmentPickerFilterState] | undefined,
  ) => {
    onFilterStateChange(setFilterValue(schema, filterState, id, value))
  }

  return { handleValueChange }
}

export function EquipmentPickerPrimaryFilterControls(props: EquipmentPickerFilterControlsProps) {
  const { handleValueChange } = useEquipmentPickerFilterControls(props)

  if ((props.layout.primaryFieldIds?.length ?? 0) === 0) {
    return null
  }

  return (
    <CatalogFilterControls.Primary
      schema={props.schema}
      layout={props.layout}
      state={props.filterState}
      data={props.items}
      idPrefix="equipment-picker"
      onValueChange={handleValueChange}
    />
  )
}

export function EquipmentPickerFilterRowControls(props: EquipmentPickerFilterControlsProps) {
  const { handleValueChange } = useEquipmentPickerFilterControls(props)

  if ((props.layout.filterRowFieldIds?.length ?? 0) === 0) {
    return null
  }

  return (
    <CatalogFilterControls.FilterRow
      schema={props.schema}
      layout={props.layout}
      state={props.filterState}
      data={props.items}
      idPrefix="equipment-picker"
      onValueChange={handleValueChange}
    />
  )
}
