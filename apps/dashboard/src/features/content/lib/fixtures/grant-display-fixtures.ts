import { loadSeedSpells } from '@rpg/catalog/spells'
import type { GrantGroup, SpeciesTrait } from '@rpg/contracts'

import { GRANT_SUMMARY_JOIN, type GrantDisplayVocabulary } from '../grant-display'

import { pickSpecies, pickSpell } from './pick'
import { STORY_RULESET_ID } from './constants'

/** Catalog Wood Elf heritage option grant groups from the Elf species seed. */
export function getCatalogWoodElfHeritageGrantGroups(): GrantGroup[] {
  const woodElf = getCatalogWoodElfHeritageOption()
  return woodElf.grantGroups ?? []
}

/** Catalog Wood Elf heritage option from the Elf species seed. */
export function getCatalogWoodElfHeritageOption(): SpeciesTrait {
  const elf = pickSpecies('elf')
  const woodElf = elf.heritage?.options.find((option) => option.id === 'wood-elf')
  if (!woodElf) {
    throw new Error('Expected Elf seed to include a Wood Elf heritage option')
  }
  return woodElf
}

/** Catalog Drow heritage option grant groups from the Elf species seed. */
export function getCatalogDrowHeritageGrantGroups(): GrantGroup[] {
  const drow = getCatalogDrowHeritageOption()
  return drow.grantGroups ?? []
}

/** Catalog Drow heritage option from the Elf species seed. */
export function getCatalogDrowHeritageOption(): SpeciesTrait {
  const elf = pickSpecies('elf')
  const drow = elf.heritage?.options.find((option) => option.id === 'drow')
  if (!drow) {
    throw new Error('Expected Elf seed to include a Drow heritage option')
  }
  return drow
}

/** Vocabulary resolving catalog spell names for Drow lineage grants. */
export function buildCatalogDrowGrantDisplayVocabulary(): GrantDisplayVocabulary {
  return {
    resolveSenseLabel: (type) => (type === 'darkvision' ? 'Darkvision' : type),
    resolveSpell: (slug) => {
      const spell = pickSpell(slug)
      return { name: spell.name, level: spell.level }
    },
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
    text: `Darkvision 120 ft${GRANT_SUMMARY_JOIN}Dancing Lights cantrip`,
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
