import type { Meta, StoryObj } from '@storybook/react-vite'
import { useMemo, useState } from 'react'

import { formatContentReferenceLabel } from '@/features/character'

import {
  createCharacterRelationshipFilterSchema,
  resolveCharacterRelationshipFilterLayout,
  type CharacterRelationshipFilterState,
} from './character-relationship-filter-schema'
import { RelationshipCatalogFilterBand } from './relationship-catalog-filter-band'

const rows = [
  { id: 'aria', characterType: 'pc' as const, classIds: ['class-wizard'] },
  { id: 'darius', characterType: 'npc' as const, classIds: ['class-rogue'] },
]

function CharacterFilterBandStory() {
  const schema = useMemo(
    () =>
      createCharacterRelationshipFilterSchema({
        rows,
        getCharacterType: (row) => row.characterType,
        getClassIds: (row) => row.classIds,
        resolveClassLabel: formatContentReferenceLabel,
      }),
    [],
  )
  const layout = useMemo(() => resolveCharacterRelationshipFilterLayout(schema), [schema])
  const [state, setState] = useState<CharacterRelationshipFilterState>({})

  return (
    <div className="flex flex-col gap-4 p-4">
      <RelationshipCatalogFilterBand
        band="primary"
        schema={schema}
        layout={layout}
        state={state}
        data={rows}
        idPrefix="relationship-filter-story"
        onValueChange={(id, value) => setState((current) => ({ ...current, [id]: value }))}
      />
      <RelationshipCatalogFilterBand
        band="filterRow"
        schema={schema}
        layout={layout}
        state={state}
        data={rows}
        idPrefix="relationship-filter-story"
        onValueChange={(id, value) => setState((current) => ({ ...current, [id]: value }))}
      />
    </div>
  )
}

const meta = {
  title: 'Content/Catalog/RelationshipCatalogFilterBand',
  component: CharacterFilterBandStory,
} satisfies Meta<typeof CharacterFilterBandStory>

export default meta

type Story = StoryObj<typeof CharacterFilterBandStory>

export const CharacterTypeAndClass: Story = {}
