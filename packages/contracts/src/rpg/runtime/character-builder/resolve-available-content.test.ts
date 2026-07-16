import { describe, expect, it } from 'vitest'

import type { ClassStored } from '../../content/classes/class'
import { equipmentSchema } from '../../content/equipment'
import type { Species } from '../../content/species'
import type { Spell } from '../../content/spell'
import { resolveCharacterCreationPatch } from '../../campaign/patches/campaign-character-creation-patch'
import { defaultCampaignMechanicsPatch } from '../../campaign/patches/campaign-mechanics-patch'
import type { CharacterBuildContext } from './context'
import { DEFAULT_ABILITY_GENERATION_RULES } from './ability-generation'
import { startingWealthSeed } from './test-fixtures'
import { resolveAvailableContent } from './resolve-available-content'

const timestamps = {
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
} as const

function makeStoredClass(slug: string, name: string): ClassStored {
  return {
    id: `srd-cc-5.2.1:${slug}`,
    slug,
    rulesetId: 'srd-cc-5.2.1',
    source: 'system',
    campaignId: null,
    ...timestamps,
    name,
    primaryAbilities: ['str'],
    hitDie: 10,
    proficiencies: {
      savingThrows: ['str', 'con'],
      armor: { categories: ['light'], items: [] },
      weapons: { categories: ['simple'], items: [] },
      skills: { categories: [], items: [] },
    },
    features: [],
  }
}

function makeSpecies(slug: string, creatureType: Species['creatureType']): Species {
  return {
    id: `srd-cc-5.2.1:${slug}`,
    slug,
    rulesetId: 'srd-cc-5.2.1',
    source: 'system',
    campaignId: null,
    ...timestamps,
    name: slug,
    description: `<p>${slug}</p>`,
    creatureType,
    sizes: ['medium'],
    movement: { walk: 30 },
    traits: [],
  }
}

function makeSpell(slug: string, classIds: Spell['classIds']): Spell {
  return {
    id: `srd-cc-5.2.1:${slug}`,
    slug,
    rulesetId: 'srd-cc-5.2.1',
    source: 'system',
    campaignId: null,
    ...timestamps,
    name: slug,
    description: `<p>${slug}</p>`,
    school: 'evocation',
    level: 0,
    classIds,
    castingTime: { normal: { value: 1, unit: 'action' }, canBeCastAsRitual: false },
    range: { kind: 'distance', value: { value: 60, unit: 'ft' } },
    duration: { kind: 'instantaneous' },
    components: { verbal: true, somatic: true },
  }
}

function makeContext(
  overrides: Partial<CharacterBuildContext> & {
    creatureTypePolicy?: CharacterBuildContext['characterCreationRules']['species']['creatureTypePolicy']
  } = {},
): CharacterBuildContext {
  const { creatureTypePolicy, ...rest } = overrides
  const baseRules = {
    ...resolveCharacterCreationPatch(undefined, startingWealthSeed),
    abilityGeneration: DEFAULT_ABILITY_GENERATION_RULES,
    armorClass: defaultCampaignMechanicsPatch().armorClass,
  }

  return {
    mode: 'dashboard',
    scope: { type: 'standalone', rulesetId: 'srd-cc-5.2.1' },
    rulesetId: 'srd-cc-5.2.1',
    catalog: {
      species: [],
      classes: [],
      spells: [],
      equipment: [],
      skillProficiencies: [],
      languages: [],
    },
    characterCreationRules: {
      ...baseRules,
      species: {
        creatureTypePolicy: creatureTypePolicy ?? baseRules.species.creatureTypePolicy,
      },
    },
    permissions: { canCreateCharacter: true },
    ...rest,
  }
}

describe('resolveAvailableContent', () => {
  it('filters species by resolved creatureTypePolicy (default humanoid only)', () => {
    const context = makeContext({
      catalog: {
        species: [makeSpecies('dwarf', 'humanoid'), makeSpecies('pixie', 'fey')],
        classes: [],
        spells: [],
        equipment: [],
        skillProficiencies: [],
        languages: [],
      },
    })

    const result = resolveAvailableContent(context)

    expect(result.species.map((entry) => entry.slug)).toEqual(['dwarf'])
  })

  it('includes species matching a widened creatureTypePolicy', () => {
    const context = makeContext({
      creatureTypePolicy: { mode: 'only', ids: ['humanoid', 'fey'] },
      catalog: {
        species: [makeSpecies('dwarf', 'humanoid'), makeSpecies('pixie', 'fey')],
        classes: [],
        spells: [],
        equipment: [],
        skillProficiencies: [],
        languages: [],
      },
    })

    const result = resolveAvailableContent(context)

    expect(result.species.map((entry) => entry.slug).sort()).toEqual(['dwarf', 'pixie'])
  })

  it('includes all classes from the catalog', () => {
    const fighter = makeStoredClass('fighter', 'Fighter')
    const wizard = makeStoredClass('wizard', 'Wizard')
    const context = makeContext({
      catalog: {
        species: [],
        classes: [fighter, wizard],
        spells: [],
        equipment: [],
        skillProficiencies: [],
        languages: [],
      },
    })

    const result = resolveAvailableContent(context)

    expect(result.classes.map((entry) => entry.slug).sort()).toEqual(['fighter', 'wizard'])
  })

  it('filters spells to those learnable by available classes', () => {
    const fighter = makeStoredClass('fighter', 'Fighter')
    const wizard = makeStoredClass('wizard', 'Wizard')
    const context = makeContext({
      catalog: {
        species: [],
        classes: [fighter, wizard],
        spells: [
          makeSpell('fire-bolt', ['wizard']),
          makeSpell('true-strike', ['bard', 'sorcerer', 'warlock', 'wizard']),
        ],
        equipment: [],
        skillProficiencies: [],
        languages: [],
      },
    })

    const result = resolveAvailableContent(context)

    expect(result.spells.map((entry) => entry.slug).sort()).toEqual(['fire-bolt', 'true-strike'])
  })

  it('passes equipment through unchanged', () => {
    const equipment = equipmentSchema.parse({
      id: 'srd-cc-5.2.1:longsword',
      slug: 'longsword',
      rulesetId: 'srd-cc-5.2.1',
      source: 'system',
      campaignId: null,
      ...timestamps,
      kind: 'weapon',
      name: 'Longsword',
      cost: { amount: 15, currency: 'gp' },
      category: 'martial',
      mode: 'melee',
      damage: { dice: { count: 1, faces: 8 } },
      damageType: 'slashing',
      properties: [],
      mastery: 'sap',
    })

    const context = makeContext({
      catalog: {
        species: [],
        classes: [],
        spells: [],
        equipment: [equipment],
        skillProficiencies: [],
        languages: [],
      },
    })

    const result = resolveAvailableContent(context)

    expect(result.equipment).toEqual([equipment])
  })
})
