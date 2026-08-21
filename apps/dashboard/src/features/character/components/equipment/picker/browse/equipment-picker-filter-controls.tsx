import { CatalogFilterControls, setFilterValue } from '@rpg/ui/filters'
import { useMemo } from 'react'

import {
  createEquipmentPickerFilterSchema,
  resolveEquipmentPickerFilterLayout,
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
  const layout = useMemo(() => resolveEquipmentPickerFilterLayout(schema), [schema])

  const handleValueChange = (
    id: keyof EquipmentPickerFilterState,
    value: EquipmentPickerFilterState[keyof EquipmentPickerFilterState] | undefined,
  ) => {
    onFilterStateChange(setFilterValue(schema, filterState, id, value))
  }

  return { schema, layout, handleValueChange }
}

export function EquipmentPickerPrimaryFilterControls(props: EquipmentPickerFilterControlsProps) {
  const { schema, layout, handleValueChange } = useEquipmentPickerFilterControls(props)

  if ((layout.primaryFieldIds?.length ?? 0) === 0) {
    return null
  }

  return (
    <CatalogFilterControls.Primary
      schema={schema}
      layout={layout}
      state={props.filterState}
      data={props.schemaArgs.items}
      idPrefix="equipment-picker"
      onValueChange={handleValueChange}
    />
  )
}

export function EquipmentPickerFilterRowControls(props: EquipmentPickerFilterControlsProps) {
  const { schema, layout, handleValueChange } = useEquipmentPickerFilterControls(props)

  if ((layout.filterRowFieldIds?.length ?? 0) === 0) {
    return null
  }

  return (
    <CatalogFilterControls.FilterRow
      schema={schema}
      layout={layout}
      state={props.filterState}
      data={props.schemaArgs.items}
      idPrefix="equipment-picker"
      onValueChange={handleValueChange}
    />
  )
}
