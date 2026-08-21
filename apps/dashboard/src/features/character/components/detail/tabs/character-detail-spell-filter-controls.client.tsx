'use client'

import { CatalogFilterControls, setFilterValue } from '@rpg/ui/filters'
import { useMemo } from 'react'

import {
  CHARACTER_DETAIL_SPELL_FILTER_LAYOUT,
  createCharacterDetailSpellFilterSchema,
  type CharacterDetailSpellFilterState,
  type CreateCharacterDetailSpellFilterSchemaArgs,
} from '../../../lib/detail/character-detail-spell-filter-schema'

type CharacterDetailSpellFilterControlsProps = {
  schemaArgs: CreateCharacterDetailSpellFilterSchemaArgs
  filterState: CharacterDetailSpellFilterState
  onFilterStateChange: (next: CharacterDetailSpellFilterState) => void
}

export function CharacterDetailSpellFilterControls({
  schemaArgs,
  filterState,
  onFilterStateChange,
}: CharacterDetailSpellFilterControlsProps) {
  const schema = useMemo(() => createCharacterDetailSpellFilterSchema(schemaArgs), [schemaArgs])

  const handleValueChange = (
    id: keyof CharacterDetailSpellFilterState,
    value: CharacterDetailSpellFilterState[keyof CharacterDetailSpellFilterState] | undefined,
  ) => {
    onFilterStateChange(setFilterValue(schema, filterState, id, value))
  }

  return (
    <CatalogFilterControls.Primary
      schema={schema}
      layout={CHARACTER_DETAIL_SPELL_FILTER_LAYOUT}
      state={filterState}
      data={schemaArgs.cards}
      idPrefix="character-detail-spells"
      onValueChange={handleValueChange}
    />
  )
}
