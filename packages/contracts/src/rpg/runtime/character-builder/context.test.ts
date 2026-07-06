import { describe, expect, it } from 'vitest'

import { resolveCharacterCreationPatch } from '../../campaign/patches/campaign-character-creation-patch'
import { defaultCampaignMechanicsPatch } from '../../campaign/patches/campaign-mechanics-patch'
import type { StartingWealthRules } from '../../campaign/rules/starting-wealth'
import { DEFAULT_ABILITY_GENERATION_RULES } from './ability-generation'
import { indexCharacterBuildCatalog, resolvedCharacterCreationRulesSchema } from './context'
import type { CharacterBuildCatalog } from './context'

const emptyCatalog: CharacterBuildCatalog = {
  species: [],
  classes: [],
  spells: [],
  equipment: [],
  skillProficiencies: [],
  languages: [],
}

describe('indexCharacterBuildCatalog', () => {
  it('indexes every catalog list by id', () => {
    const catalog = {
      ...emptyCatalog,
      species: [
        { id: 'srd-cc-5.2.1:dwarf' },
        { id: 'srd-cc-5.2.1:elf' },
      ] as CharacterBuildCatalog['species'],
    }

    const index = indexCharacterBuildCatalog(catalog)

    expect(index.species.get('srd-cc-5.2.1:dwarf')).toBe(catalog.species[0])
    expect(index.species.get('srd-cc-5.2.1:elf')).toBe(catalog.species[1])
    expect(index.species.size).toBe(2)
    expect(index.classes.size).toBe(0)
    expect(index.spells.size).toBe(0)
    expect(index.equipment.size).toBe(0)
    expect(index.skillProficiencies.size).toBe(0)
  })
})

describe('resolvedCharacterCreationRulesSchema', () => {
  it('extends the resolved campaign patch with ability generation', () => {
    const startingWealthSeed: StartingWealthRules = {
      name: 'Standard starting wealth',
      scope: { kind: 'standard' },
      tiers: [
        {
          id: 'tier-1',
          label: 'Levels 1–4',
          minLevel: 1,
          maxLevel: 20,
          includeNormalStartingEquipment: true,
          magicItemGrants: [],
        },
      ],
    }

    const rules = {
      ...resolveCharacterCreationPatch(undefined, startingWealthSeed),
      abilityGeneration: DEFAULT_ABILITY_GENERATION_RULES,
      armorClass: defaultCampaignMechanicsPatch().armorClass,
    }

    const result = resolvedCharacterCreationRulesSchema.safeParse(rules)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.startingLevel).toBe(1)
      expect(result.data.abilityGeneration.methods).toEqual(['standard-array', 'manual'])
      expect(result.data.abilityGeneration.standardArray).toEqual([15, 14, 13, 12, 10, 8])
      expect(result.data.armorClass).toEqual({ mode: 'ascending', base: 10 })
    }
  })
})
