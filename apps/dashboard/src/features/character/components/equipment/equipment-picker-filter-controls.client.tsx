'use client'

import { CatalogFilterControls, setFilterValue } from '@rpg/ui/filters'
import { useMemo } from 'react'

import {
  createEquipmentPickerFilterSchema,
  EQUIPMENT_PICKER_FILTER_LAYOUT,
  type EquipmentPickerFilterState,
} from './equipment-picker-filter-schema'
import type { CreateEquipmentPickerFilterSchemaArgs } from './equipment-picker-filter-schema'

type EquipmentPickerFilterControlsProps = {
  schemaArgs: CreateEquipmentPickerFilterSchemaArgs
  filterState: EquipmentPickerFilterState
  onFilterStateChange: (next: EquipmentPickerFilterState) => void
}

function useEquipmentPickerFilterControls({
  schemaArgs,
  filterState,
  onFilterStateChange,
}: EquipmentPickerFilterControlsProps) {
  const schema = useMemo(() => createEquipmentPickerFilterSchema(schemaArgs), [schemaArgs])

  const handleValueChange = (
    id: keyof EquipmentPickerFilterState,
    value: EquipmentPickerFilterState[keyof EquipmentPickerFilterState] | undefined,
  ) => {
    onFilterStateChange(setFilterValue(schema, filterState, id, value))
  }

  return { schema, handleValueChange }
}

export function EquipmentPickerPrimaryFilterControls(props: EquipmentPickerFilterControlsProps) {
  const { schema, handleValueChange } = useEquipmentPickerFilterControls(props)

  return (
    <CatalogFilterControls.Primary
      schema={schema}
      layout={EQUIPMENT_PICKER_FILTER_LAYOUT}
      state={props.filterState}
      data={props.schemaArgs.items}
      idPrefix="equipment-picker"
      onValueChange={handleValueChange}
    />
  )
}

export function EquipmentPickerFilterRowControls(props: EquipmentPickerFilterControlsProps) {
  const { schema, handleValueChange } = useEquipmentPickerFilterControls(props)

  return (
    <CatalogFilterControls.FilterRow
      schema={schema}
      layout={EQUIPMENT_PICKER_FILTER_LAYOUT}
      state={props.filterState}
      data={props.schemaArgs.items}
      idPrefix="equipment-picker"
      onValueChange={handleValueChange}
    />
  )
}
