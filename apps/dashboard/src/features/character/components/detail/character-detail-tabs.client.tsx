'use client'

import type { ReactNode } from 'react'
import type { CharacterNarrative } from '@rpg/contracts'
import { Tabs, TabsContent, TabsList, TabsTrigger, Text } from '@rpg/ui'

import {
  CHARACTER_DETAIL_TAB_LABELS,
  CHARACTER_EMPTY_SECTION_TEXT,
  type CharacterDetailListItem,
  type CharacterDetailListSection,
  type CharacterWealthViewModel,
} from '../../lib/display/character-display'
import type {
  CharacterSheetEquipmentCard,
  CharacterSheetSpellCard,
} from '../../lib/detail/character-sheet-catalog'
import { narrativeFieldCount } from '../../lib/builder-preview/narrative-preview'
import { CharacterDetailEquipmentTab } from './character-detail-equipment-tab.client'
import { CharacterDetailNarrativeSection } from './character-detail-narrative-section.client'
import { CharacterDetailSpellsTab } from './character-detail-spells-tab.client'
import { characterDetailTabPanelClasses } from './character-detail-sheet.variants'

export type CharacterDetailTabsProps = {
  spells: readonly CharacterSheetSpellCard[]
  equipment: readonly CharacterSheetEquipmentCard[]
  wealth: CharacterWealthViewModel
  classFeatures: CharacterDetailListSection
  speciesTraits: CharacterDetailListSection
  feats: CharacterDetailListSection
  connections: CharacterDetailListSection
  narrative: CharacterNarrative | undefined
}

/** Lower sheet tabs — spells, equipment, features and traits, narrative. */
export function CharacterDetailTabs({
  spells,
  equipment,
  wealth,
  classFeatures,
  speciesTraits,
  feats,
  connections,
  narrative,
}: CharacterDetailTabsProps) {
  const featuresAndTraitsItems = [...classFeatures.items, ...speciesTraits.items, ...feats.items]

  return (
    <Tabs defaultValue="spells" variant="line">
      <TabsList>
        <TabsTrigger value="spells">{CHARACTER_DETAIL_TAB_LABELS.spells}</TabsTrigger>
        <TabsTrigger value="equipment">{CHARACTER_DETAIL_TAB_LABELS.equipment}</TabsTrigger>
        <TabsTrigger value="features-and-traits">
          {CHARACTER_DETAIL_TAB_LABELS.featuresAndTraits}
        </TabsTrigger>
        {connections.items.length > 0 ? (
          <TabsTrigger value="connections">{CHARACTER_DETAIL_TAB_LABELS.connections}</TabsTrigger>
        ) : null}
        <TabsTrigger value="narrative">{CHARACTER_DETAIL_TAB_LABELS.narrative}</TabsTrigger>
      </TabsList>

      <TabsContent value="spells">
        <CharacterDetailTabPanel>
          <CharacterDetailSpellsTab cards={spells} />
        </CharacterDetailTabPanel>
      </TabsContent>

      <TabsContent value="equipment">
        <CharacterDetailTabPanel>
          <CharacterDetailEquipmentTab cards={equipment} wealth={wealth} />
        </CharacterDetailTabPanel>
      </TabsContent>

      <TabsContent value="features-and-traits">
        <CharacterDetailTabPanel>
          <CharacterDetailListItems
            items={featuresAndTraitsItems}
            emptyText={CHARACTER_EMPTY_SECTION_TEXT.featuresAndTraits}
          />
        </CharacterDetailTabPanel>
      </TabsContent>

      {connections.items.length > 0 ? (
        <TabsContent value="connections">
          <CharacterDetailTabPanel>
            <CharacterDetailListItems items={connections.items} emptyText={connections.emptyText} />
          </CharacterDetailTabPanel>
        </TabsContent>
      ) : null}

      <TabsContent value="narrative">
        <CharacterDetailTabPanel>
          {narrativeFieldCount(narrative) === 0 ? (
            <Text variant="muted">{CHARACTER_EMPTY_SECTION_TEXT.narrative}</Text>
          ) : (
            <CharacterDetailNarrativeSection narrative={narrative} />
          )}
        </CharacterDetailTabPanel>
      </TabsContent>
    </Tabs>
  )
}

function CharacterDetailTabPanel({ children }: { children: ReactNode }) {
  return <div className={characterDetailTabPanelClasses}>{children}</div>
}

function CharacterDetailListItems({
  items,
  emptyText,
}: {
  items: CharacterDetailListItem[]
  emptyText: string
}) {
  if (items.length === 0) {
    return <Text variant="muted">{emptyText}</Text>
  }

  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item.id} className="rounded-md bg-surface-subtle px-3 py-2">
          <div className="font-medium">{item.label}</div>
          {item.detail ? <div className="text-muted-foreground">{item.detail}</div> : null}
        </li>
      ))}
    </ul>
  )
}
