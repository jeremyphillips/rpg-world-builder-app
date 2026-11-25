import { loadSeedSpells } from '@rpg/catalog/spells'
import {
  createEquipmentCatalogContext,
  createSpellCatalogContext,
  type GrantGroup,
  type Species,
  type SpeciesBodyTrait,
} from '@rpg/contracts'

import { joinInlineMetadata } from '@rpg/contracts/primitives'

import { type GrantDisplayVocabulary } from '../forms/grants/grant-display'

import { pickClass, pickEquipment, pickSpecies } from './pick'
import { STORY_RULESET_ID } from './constants'

/** Catalog Wood Elf heritage option grant groups from the Elf species seed. */
export function getCatalogWoodElfHeritageGrantGroups(): GrantGroup[] {
  const woodElf = getCatalogWoodElfHeritageOption()
  if (woodElf.kind === 'template') return []
  return woodElf.grantGroups ?? []
}

/** Catalog Wood Elf heritage option from the Elf species seed. */
export function getCatalogWoodElfHeritageOption(): SpeciesBodyTrait {
  const elf = pickSpecies('elf')
  const woodElf = elf.heritage?.options.find((option) => option.id === 'wood-elf')
  if (!woodElf) {
    throw new Error('Expected Elf seed to include a Wood Elf heritage option')
  }
  return woodElf
}

/** Catalog Druidic feature grant groups from the Druid class seed. */
export function getCatalogDruidDruidicGrantGroups(): GrantGroup[] {
  const druidic = getCatalogDruidDruidicFeature()
  return druidic.kind === 'custom' ? (druidic.grantGroups ?? []) : []
}

/** Catalog Druidic class feature from the Druid class seed. */
export function getCatalogDruidDruidicFeature() {
  const druid = pickClass('druid')
  const druidic = druid.features.find((feature) => feature.id === 'druidic')
  if (!druidic) {
    throw new Error('Expected Druid seed to include a Druidic class feature')
  }
  return druidic
}

/** Catalog Drow heritage option grant groups from the Elf species seed. */
export function getCatalogDrowHeritageGrantGroups(): GrantGroup[] {
  const drow = getCatalogDrowHeritageOption()
  if (drow.kind === 'template') return []
  return drow.grantGroups ?? []
}

/** Catalog Black Dragon heritage option grant groups from the Dragonborn species seed. */
export function getCatalogBlackDragonHeritageGrantGroups(): GrantGroup[] {
  const blackDragon = getCatalogBlackDragonHeritageOption()
  if (blackDragon.kind === 'template') return []
  return blackDragon.grantGroups ?? []
}

/** Catalog Black Dragon heritage option from the Dragonborn species seed. */
export function getCatalogBlackDragonHeritageOption(): SpeciesBodyTrait {
  const dragonborn = pickSpecies('dragonborn')
  const blackDragon = dragonborn.heritage?.options.find((option) => option.id === 'black')
  if (!blackDragon) {
    throw new Error('Expected Dragonborn seed to include a Black heritage option')
  }
  return blackDragon
}

/** Catalog Drow heritage option from the Elf species seed. */
export function getCatalogDrowHeritageOption(): SpeciesBodyTrait {
  const elf = pickSpecies('elf')
  const drow = elf.heritage?.options.find((option) => option.id === 'drow')
  if (!drow) {
    throw new Error('Expected Elf seed to include a Drow heritage option')
  }
  return drow
}

/** Scoped catalog fixture for grants using specific equipment slugs. */
export function buildCatalogEquipmentGrantVocabulary(
  slugs: readonly string[],
): Pick<GrantDisplayVocabulary, 'equipmentCatalog'> {
  const equipment = slugs.map((slug) => pickEquipment(slug))
  return {
    equipmentCatalog: createEquipmentCatalogContext({
      status: 'ready',
      scope: { rulesetId: STORY_RULESET_ID, campaignId: '' },
      equipmentById: new Map(equipment.map((item) => [item.id, item])),
    }),
  }
}

/** Vocabulary for grant summaries using the system spell catalog. */
export function buildCatalogDrowGrantDisplayVocabulary(): GrantDisplayVocabulary {
  return {
    resolveSenseLabel: (type) => (type === 'darkvision' ? 'Darkvision' : type),
    spellCatalog: createSpellCatalogContext({
      status: 'ready',
      spellsById: new Map(loadSeedSpells(STORY_RULESET_ID).map((spell) => [spell.id, spell])),
    }),
  }
}

/** Spell catalog rows needed to resolve Drow lineage grant summaries. */
export function getDrowHeritageSpellCatalog() {
  return loadSeedSpells(STORY_RULESET_ID).filter((spell) =>
    ['dancing-lights', 'faerie-fire', 'darkness'].includes(spell.slug),
  )
}

export const DROW_HERITAGE_GROUPED_SUMMARY_WITH_SUFFIX = [
  {
    label: 'L1',
    text: joinInlineMetadata(['Darkvision 120 ft.', 'Dancing Lights cantrip']),
  },
  {
    label: 'L3',
    text: 'Faerie Fire spell',
  },
  {
    label: 'L5',
    text: 'Darkness spell',
  },
] as const

export const DROW_HERITAGE_SHEET_SUMMARY_LINES = DROW_HERITAGE_GROUPED_SUMMARY_WITH_SUFFIX.map(
  ({ label, text }) => `${label}: ${text}`,
)

/** A saved lineage with a renamed draft weapon and a stale proficiency reference. */
export function buildScopedHeritageEquipmentFixture() {
  const equipment = { ...pickEquipment('dagger'), name: 'River Blade', status: 'draft' as const }
  const scope = { rulesetId: STORY_RULESET_ID, campaignId: 'heritage-reference-campaign' }
  const species: Species = {
    ...pickSpecies('elf'),
    heritage: {
      id: 'river-lineage',
      name: 'River Lineage',
      choose: 1,
      options: [
        {
          id: 'river',
          kind: 'custom',
          name: 'River',
          grantGroups: [
            {
              grants: [
                {
                  id: 'gear',
                  kind: 'equipment',
                  grant: { kind: 'grant', equipmentSlug: equipment.slug, quantity: 1 },
                },
                {
                  id: 'weapons',
                  kind: 'weaponProficiency',
                  grant: { kind: 'fixed', weaponSlugs: [equipment.slug, 'retired-weapon'] },
                },
              ],
            },
          ],
        },
      ],
    },
  }
  const equipmentCatalog = createEquipmentCatalogContext({
    scope,
    status: 'ready',
    equipmentById: new Map([[equipment.id, equipment]]),
  })
  return {
    species,
    equipmentCatalog,
    expectedSummary: `L1: ${joinInlineMetadata([equipment.name, `${equipment.name} proficiency, Equipment reference unavailable`])}`,
  }
}
