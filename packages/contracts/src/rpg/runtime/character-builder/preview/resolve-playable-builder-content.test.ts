import { describe, expect, it } from 'vitest'

import type { ClassStored } from '../../../content/classes/class'
import { equipmentSchema } from '../../../content/equipment'
import type { Species } from '../../../content/species'
import type { Spell } from '../../../content/spell'
import type { Organization } from '../../../content/organization'
import type { ResolvedContentCampaignAccess } from '../../../content/lib/campaign-access'
import { resolveCharacterCreationPatch } from '../../../campaign/patches/campaign-character-creation-patch'
import { defaultCampaignMechanicsPatch } from '../../../campaign/patches/campaign-mechanics-patch'
import { resolveCharacterOwnershipTarget } from '../../character-acquisition'
import type { CharacterBuildContext } from '../context'
import { DEFAULT_ABILITY_GENERATION_RULES } from '../ability/ability-generation'
import { startingWealthSeed } from '../test-fixtures'
import { resolvePlayableBuilderContent } from './resolve-playable-builder-content'

const timestamps = {
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
} as const

function makeStoredClass(
  slug: string,
  name: string,
  overrides: Partial<ClassStored> = {},
): ClassStored {
  return {
    id: `srd-cc-5.2.1:${slug}`,
    slug,
    rulesetId: 'srd-cc-5.2.1',
    source: 'system',
    status: 'published',
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
    ...overrides,
  }
}

function makeSpecies(slug: string, creatureType: Species['creatureType']): Species {
  return {
    id: `srd-cc-5.2.1:${slug}`,
    slug,
    rulesetId: 'srd-cc-5.2.1',
    source: 'system',
    status: 'published',
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
    status: 'published',
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

function makeOrganization(
  slug: string,
  visibilityMode: 'all_players' | 'dm_only',
): Organization & { campaignAccess: ResolvedContentCampaignAccess } {
  return {
    id: `srd-cc-5.2.1:${slug}`,
    slug,
    rulesetId: 'srd-cc-5.2.1',
    source: 'system',
    status: 'published',
    campaignId: null,
    ...timestamps,
    name: slug,
    organizationDomain: 'occupational',
    functions: [],
    practices: [],
    members: { classAffinityIds: [], speciesAffinityIds: [], titles: [] },
    connections: { locations: [] },
    campaignAccess: {
      available: true,
      visibilityMode,
      participantIds: [],
      unavailableParticipantIds: [],
      effectiveAudience: visibilityMode,
    },
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
    channel: 'build',
    surface: 'dashboard',
    characterKind: 'pc',
    mode: 'dashboard',
    scope: { type: 'standalone', rulesetId: 'srd-cc-5.2.1' },
    rulesScope: { type: 'ruleset', rulesetId: 'srd-cc-5.2.1' },
    ownershipTarget: resolveCharacterOwnershipTarget('pc', {
      type: 'ruleset',
      rulesetId: 'srd-cc-5.2.1',
    }),
    rulesetId: 'srd-cc-5.2.1',
    catalog: {
      species: [],
      classes: [],
      spells: [],
      equipment: [],
      skillProficiencies: [],
      organizations: [],
      languages: [],
    },
    characterCreationRules: {
      ...baseRules,
      species: {
        creatureTypePolicy: creatureTypePolicy ?? baseRules.species.creatureTypePolicy,
      },
    },
    permissions: { canCreateCharacter: true },
    playActor: { kind: 'new_pc' },
    ...rest,
  }
}

describe('resolvePlayableBuilderContent', () => {
  it('filters species by resolved creatureTypePolicy (default humanoid only)', () => {
    const context = makeContext({
      catalog: {
        species: [makeSpecies('dwarf', 'humanoid'), makeSpecies('pixie', 'fey')],
        classes: [],
        spells: [],
        equipment: [],
        skillProficiencies: [],
        organizations: [],
        languages: [],
      },
    })

    const result = resolvePlayableBuilderContent(context)

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
        organizations: [],
        languages: [],
      },
    })

    const result = resolvePlayableBuilderContent(context)

    expect(result.species.map((entry) => entry.slug).sort()).toEqual(['dwarf', 'pixie'])
  })

  it('excludes draft classes from the playable universe', () => {
    const fighter = makeStoredClass('fighter', 'Fighter')
    const draftPaladin = makeStoredClass('paladin', 'Paladin', { status: 'draft' })
    const context = makeContext({
      catalog: {
        species: [],
        classes: [fighter, draftPaladin],
        spells: [],
        equipment: [],
        skillProficiencies: [],
        organizations: [],
        languages: [],
      },
    })

    const result = resolvePlayableBuilderContent(context)

    expect(result.classes.map((entry) => entry.slug)).toEqual(['fighter'])
  })

  it('filters spells to those learnable by playable classes', () => {
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
        organizations: [],
        languages: [],
      },
    })

    const result = resolvePlayableBuilderContent(context)

    expect(result.spells.map((entry) => entry.slug).sort()).toEqual(['fire-bolt', 'true-strike'])
  })

  it('omits unavailable classes from the playable universe', () => {
    const fighter = makeStoredClass('fighter', 'Fighter')
    const unavailablePaladin = {
      ...makeStoredClass('paladin', 'Paladin'),
      campaignAccess: {
        available: false,
        visibilityMode: 'all_players' as const,
        participantIds: [],
        unavailableParticipantIds: [],
        effectiveAudience: 'none' as const,
      },
    }

    const context = makeContext({
      catalog: {
        species: [],
        classes: [fighter, unavailablePaladin],
        spells: [],
        equipment: [],
        skillProficiencies: [],
        organizations: [],
        languages: [],
      },
    })

    const result = resolvePlayableBuilderContent(context)

    expect(result.classes.map((entry) => entry.slug)).toEqual(['fighter'])
  })

  it('allows dm_only classes for NPC play actor and omits them for PC play actor', () => {
    const fighter = {
      ...makeStoredClass('fighter', 'Fighter'),
      campaignAccess: {
        available: true,
        visibilityMode: 'all_players' as const,
        participantIds: [],
        unavailableParticipantIds: [],
        effectiveAudience: 'all_players' as const,
      },
    }
    const dmOnlyPaladin = {
      ...makeStoredClass('paladin', 'Paladin'),
      campaignAccess: {
        available: true,
        visibilityMode: 'dm_only' as const,
        participantIds: [],
        unavailableParticipantIds: [],
        effectiveAudience: 'dm_only' as const,
      },
    }

    const catalog = {
      species: [],
      classes: [fighter, dmOnlyPaladin],
      spells: [],
      equipment: [],
      skillProficiencies: [],
      organizations: [],
      languages: [],
    }

    const npcResult = resolvePlayableBuilderContent(
      makeContext({ playActor: { kind: 'npc' }, catalog }),
    )
    const pcResult = resolvePlayableBuilderContent(
      makeContext({ playActor: { kind: 'pc', characterId: 'pc-1' }, catalog }),
    )

    expect(npcResult.classes.map((entry) => entry.slug).sort()).toEqual(['fighter', 'paladin'])
    expect(pcResult.classes.map((entry) => entry.slug)).toEqual(['fighter'])
  })

  it('filters organizations by play actor visibility', () => {
    const context = makeContext({
      playActor: { kind: 'pc', characterId: 'pc-1' },
      catalog: {
        species: [],
        classes: [],
        spells: [],
        equipment: [],
        skillProficiencies: [],
        organizations: [
          makeOrganization('visible-guild', 'all_players'),
          makeOrganization('hidden-guild', 'dm_only'),
        ],
        languages: [],
      },
    })

    const result = resolvePlayableBuilderContent(context)

    expect(result.organizations.map((entry) => entry.slug)).toEqual(['visible-guild'])
  })

  it('excludes specific_players content for new_pc onboarding', () => {
    const fighter = {
      ...makeStoredClass('fighter', 'Fighter'),
      campaignAccess: {
        available: true,
        visibilityMode: 'all_players' as const,
        participantIds: [],
        unavailableParticipantIds: [],
        effectiveAudience: 'all_players' as const,
      },
    }
    const restrictedPaladin = {
      ...makeStoredClass('paladin', 'Paladin'),
      campaignAccess: {
        available: true,
        visibilityMode: 'specific_players' as const,
        participantIds: ['pc-a'],
        unavailableParticipantIds: [],
        effectiveAudience: 'specific_players' as const,
      },
    }

    const result = resolvePlayableBuilderContent(
      makeContext({
        playActor: { kind: 'new_pc' },
        catalog: {
          species: [],
          classes: [fighter, restrictedPaladin],
          spells: [],
          equipment: [],
          skillProficiencies: [],
          organizations: [],
          languages: [],
        },
      }),
    )

    expect(result.classes.map((entry) => entry.slug)).toEqual(['fighter'])
  })

  it('passes playable equipment through unchanged aside from eligibility filtering', () => {
    const equipment = equipmentSchema.parse({
      id: 'srd-cc-5.2.1:longsword',
      slug: 'longsword',
      rulesetId: 'srd-cc-5.2.1',
      source: 'system',
      status: 'published',
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
        organizations: [],
        languages: [],
      },
    })

    const result = resolvePlayableBuilderContent(context)

    expect(result.equipment).toEqual([equipment])
  })
})
