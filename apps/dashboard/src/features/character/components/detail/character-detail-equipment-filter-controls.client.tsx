'use client'

import { CatalogFilterControls, setFilterValue } from '@rpg/ui/filters'
import { useMemo } from 'react'

import {
  CHARACTER_DETAIL_EQUIPMENT_FILTER_LAYOUT,
  createCharacterDetailEquipmentFilterSchema,
  type CharacterDetailEquipmentFilterState,
  type CreateCharacterDetailEquipmentFilterSchemaArgs,
} from '../../lib/detail/character-detail-equipment-filter-schema'

type CharacterDetailEquipmentFilterControlsProps = {
  schemaArgs: CreateCharacterDetailEquipmentFilterSchemaArgs
  filterState: CharacterDetailEquipmentFilterState
  onFilterStateChange: (next: CharacterDetailEquipmentFilterState) => void
}

export function CharacterDetailEquipmentFilterControls({
  schemaArgs,
  filterState,
  onFilterStateChange,
}: CharacterDetailEquipmentFilterControlsProps) {
  const schema = useMemo(() => createCharacterDetailEquipmentFilterSchema(schemaArgs), [schemaArgs])

  const handleValueChange = (
    id: keyof CharacterDetailEquipmentFilterState,
    value:
      | CharacterDetailEquipmentFilterState[keyof CharacterDetailEquipmentFilterState]
      | undefined,
  ) => {
    onFilterStateChange(setFilterValue(schema, filterState, id, value))
  }

  return (
    <CatalogFilterControls.Primary
      schema={schema}
      layout={CHARACTER_DETAIL_EQUIPMENT_FILTER_LAYOUT}
      state={filterState}
      data={[]}
      idPrefix="character-detail-equipment"
      onValueChange={handleValueChange}
    />
  )
}
