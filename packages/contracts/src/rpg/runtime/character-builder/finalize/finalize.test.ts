import { describe, expect, it } from 'vitest'

import { createCharacterInputSchema } from '../../character/create-input'
import { createEmptyCharacterBuilderDraft } from '../draft/draft'
import type { CharacterBuilderDraft } from '../draft/draft'
import {
  CharacterBuildFinalizationError,
  finalizePcCharacterBuild,
  isCharacterBuildFinalizationError,
} from './finalize'
import { builderTestContext } from '../test-fixtures'
import {
  spellcastingTestContext,
  wizardCantrips,
  wizardClass,
  wizardLevelOneSpells,
} from '../spellcasting-test-fixtures'
import { resolveAvailableChoices } from '../resolvers/registry/resolve-choices'
import { resolveLanguageChoiceSets } from '../resolvers/ruleset/resolve-language-choice-sets'
import { ORIGIN_LANGUAGES_CHOICE_ID } from '../../../primitives/proficiency/character-creation-proficiency-rules'

function makeCompleteDraft(overrides: Partial<CharacterBuilderDraft> = {}): CharacterBuilderDraft {
  return {
    ...createEmptyCharacterBuilderDraft(),
    identity: { name: 'Verna', alignment: 'ng', narrative: { backstory: 'A veteran soldier.' } },
    species: { speciesId: 'srd-cc-5.2.1:dwarf' },
    class: { classId: 'srd-cc-5.2.1:fighter', level: 1 },
    abilities: {
      method: 'standard-array',
      scores: { str: 15, dex: 14, con: 13, int: 12, wis: 10, cha: 8 },
    },
    ...overrides,
  }
}

describe('finalizePcCharacterBuild', () => {
  it('returns CreateCharacterInput, never a full Character', () => {
    const input = finalizePcCharacterBuild(makeCompleteDraft(), builderTestContext)

    expect(createCharacterInputSchema.safeParse(input).success).toBe(true)
    expect((input as Record<string, unknown>)['id']).toBeUndefined()
    expect((input as Record<string, unknown>)['userId']).toBeUndefined()
    expect((input as Record<string, unknown>)['createdAt']).toBeUndefined()
  })

  it('computes hitPoints.base and xp null', () => {
    const input = finalizePcCharacterBuild(makeCompleteDraft(), builderTestContext)
    expect(input.hitPoints).toEqual({ base: 11, current: 11, temporary: 0 })
    expect(input.xp).toBeNull()
  })

  it('carries narrative from the draft identity', () => {
    const input = finalizePcCharacterBuild(makeCompleteDraft(), builderTestContext)
    expect(input.narrative).toEqual({ backstory: 'A veteran soldier.' })
  })

  it('copies normalized selectable organization memberships including titles', () => {
    const organization = {
      id: 'organization-lantern-guild',
      slug: 'lantern-guild',
      rulesetId: 'srd-cc-5.2.1' as const,
      source: 'homebrew' as const,
      status: 'published' as const,
      campaignId: 'campaign-1',
      createdAt: '2026-07-28T12:00:00.000Z',
      updatedAt: '2026-07-28T12:00:00.000Z',
      name: 'Lantern Guild',
      organizationDomain: 'occupational' as const,
      functions: [],
      practices: [],
      memberClassAffinityIds: [],
      connections: { locations: [] },
    }
    const input = finalizePcCharacterBuild(
      makeCompleteDraft({
        connections: {
          organizations: [{ organizationId: organization.id, title: 'Guildmaster' }],
          locations: [],
        },
      }),
      {
        ...builderTestContext,
        catalog: { ...builderTestContext.catalog, organizations: [organization] },
      },
    )

    expect(input.connections).toEqual({
      organizations: [{ organizationId: organization.id, title: 'Guildmaster' }],
      locations: [],
    })
  })

  it('blocks finalization when an organization connection is no longer selectable', () => {
    expect(() =>
      finalizePcCharacterBuild(
        makeCompleteDraft({
          connections: {
            organizations: [{ organizationId: 'organization-removed' }],
            locations: [],
          },
        }),
        builderTestContext,
      ),
    ).toThrow(CharacterBuildFinalizationError)
  })

  it('carries class proficiency sources', () => {
    const input = finalizePcCharacterBuild(makeCompleteDraft(), builderTestContext)

    expect(input.proficiencies.weapons[0]?.sources).toEqual([
      {
        kind: 'classFeature',
        sourceId: 'srd-cc-5.2.1:fighter',
        grantId: 'weapon-proficiencies',
      },
    ])
    expect(input.proficiencies.armor[0]?.sources).toEqual([
      {
        kind: 'classFeature',
        sourceId: 'srd-cc-5.2.1:fighter',
        grantId: 'armor-proficiencies',
      },
    ])
  })

  it('merges skill selections with selection sources', () => {
    const input = finalizePcCharacterBuild(
      makeCompleteDraft({
        choiceSelections: {
          'class:srd-cc-5.2.1:fighter:class-skills': ['srd-cc-5.2.1:athletics'],
        },
      }),
      builderTestContext,
      {
        resolvedChoiceSets: [
          {
            id: 'class:srd-cc-5.2.1:fighter:class-skills',
            sourceType: 'class',
            sourceId: 'srd-cc-5.2.1:fighter',
            choiceType: 'skillProficiency',
            label: 'Choose Skills',
            min: 1,
            max: 2,
            options: [{ id: 'srd-cc-5.2.1:athletics', label: 'Athletics' }],
            required: true,
          },
        ],
      },
    )

    expect(input.proficiencies.skills).toEqual([
      {
        skill: 'athletics',
        rank: 'proficient',
        sources: [
          {
            kind: 'classFeature',
            sourceId: 'srd-cc-5.2.1:fighter',
            grantId: 'class:srd-cc-5.2.1:fighter:class-skills',
          },
        ],
      },
    ])
  })

  it('assembles language proficiencies under proficiencies.languages', () => {
    const originChoiceSetId = `ruleset:srd-cc-5.2.1:${ORIGIN_LANGUAGES_CHOICE_ID}`
    const draft = makeCompleteDraft({
      choiceSelections: {
        [originChoiceSetId]: ['elvish', 'dwarvish'],
      },
    })
    const choiceSets = resolveLanguageChoiceSets(makeCompleteDraft(), builderTestContext)

    const input = finalizePcCharacterBuild(draft, builderTestContext, {
      resolvedChoiceSets: choiceSets,
    })

    expect(input.proficiencies.languages).toEqual([
      {
        language: 'common',
        sources: [
          {
            kind: 'characterCreation',
            sourceId: 'srd-cc-5.2.1',
            grantId: 'language-grants',
          },
        ],
      },
      {
        language: 'elvish',
        sources: [
          {
            kind: 'characterCreation',
            sourceId: 'srd-cc-5.2.1',
            grantId: originChoiceSetId,
          },
        ],
      },
      {
        language: 'dwarvish',
        sources: [
          {
            kind: 'characterCreation',
            sourceId: 'srd-cc-5.2.1',
            grantId: originChoiceSetId,
          },
        ],
      },
    ])
    expect((input as Record<string, unknown>)['languages']).toBeUndefined()
  })

  it('throws CharacterBuildFinalizationError when validation fails', () => {
    expect(() =>
      finalizePcCharacterBuild(createEmptyCharacterBuilderDraft(), builderTestContext),
    ).toThrow(CharacterBuildFinalizationError)
  })

  it('rejects NPC build contexts', () => {
    const npcContext = { ...builderTestContext, characterKind: 'npc' as const }

    expect(() => finalizePcCharacterBuild(makeCompleteDraft(), npcContext)).toThrow(
      CharacterBuildFinalizationError,
    )
  })

  it('throws validation issues when catalog entries are missing after validation', () => {
    const draft = makeCompleteDraft({
      class: { classId: 'missing-class', level: 1 },
      species: { speciesId: 'missing-species' },
    })

    try {
      finalizePcCharacterBuild(draft, builderTestContext)
      expect.fail('expected finalization to fail')
    } catch (error) {
      expect(error).toBeInstanceOf(CharacterBuildFinalizationError)
      const finalizationError = error as CharacterBuildFinalizationError
      expect(
        finalizationError.validationIssues.some((issue) => issue.code === 'class_not_in_catalog'),
      ).toBe(true)
      expect(
        finalizationError.validationIssues.some((issue) => issue.code === 'species_not_in_catalog'),
      ).toBe(true)
    }
  })

  it('rejects sibling-PC-only classes tampered into a new_pc draft at finalSubmit', () => {
    const restrictedClass = {
      ...builderTestContext.catalog.classes[0]!,
      id: 'campaign:restricted-paladin',
      slug: 'restricted-paladin',
      name: 'Restricted Paladin',
      campaignAccess: {
        available: true,
        visibilityMode: 'specific_players' as const,
        participantIds: ['sibling-pc'],
        unavailableParticipantIds: [],
        effectiveAudience: 'specific_players' as const,
      },
    }

    const context = {
      ...builderTestContext,
      playActor: { kind: 'new_pc' as const },
      catalog: {
        ...builderTestContext.catalog,
        classes: [...builderTestContext.catalog.classes, restrictedClass],
      },
    }

    expect(() =>
      finalizePcCharacterBuild(
        makeCompleteDraft({ class: { classId: restrictedClass.id, level: 1 } }),
        context,
      ),
    ).toThrow(CharacterBuildFinalizationError)
  })

  it('isCharacterBuildFinalizationError recognizes errors across module instances', () => {
    try {
      finalizePcCharacterBuild(createEmptyCharacterBuilderDraft(), builderTestContext)
    } catch (error) {
      const foreignError = Object.assign(
        Object.create(CharacterBuildFinalizationError.prototype),
        error,
      )
      expect(isCharacterBuildFinalizationError(foreignError)).toBe(true)
    }
  })

  it('assembles starting equipment and wealth when resolved choice sets are provided', () => {
    const storedFighterWithEquipment = {
      ...builderTestContext.catalog.classes[0]!,
      characterCreation: {
        proficiencies: {
          skills: {
            choices: [{ id: 'class-skills', choose: 1, from: ['athletics'] }],
          },
        },
        startingEquipment: {
          choose: 1,
          options: [
            {
              id: 'pack-a',
              label: 'Pack A',
              items: [],
              wealth: { gp: 10 },
            },
          ],
        },
      },
    }

    const context = {
      ...builderTestContext,
      catalog: {
        ...builderTestContext.catalog,
        classes: [storedFighterWithEquipment],
      },
    }

    const input = finalizePcCharacterBuild(
      makeCompleteDraft({
        class: { classId: storedFighterWithEquipment.id, level: 1 },
        choiceSelections: {
          'class:srd-cc-5.2.1:fighter:starting-equipment': ['pack-a'],
        },
      }),
      context,
      {
        resolvedChoiceSets: [
          {
            id: 'class:srd-cc-5.2.1:fighter:starting-equipment',
            sourceType: 'class',
            sourceId: 'srd-cc-5.2.1:fighter',
            choiceType: 'equipment',
            label: 'Choose Starting Equipment',
            min: 1,
            max: 1,
            options: [{ id: 'pack-a', label: 'Pack A' }],
            required: true,
          },
        ],
      },
    )

    expect(input.wealth).toEqual({ cp: 0, sp: 0, gp: 10, pp: 0 })
    expect(input.equipment).toEqual({
      weapons: [],
      armor: [],
      tools: [],
      gear: [],
      magicItems: [],
      vehicles: [],
      mounts: [],
    })
  })

  it('assembles equipment entries and remaining wealth from the draft equipment section', () => {
    const rope = {
      id: 'srd-cc-5.2.1:rope',
      slug: 'rope',
      rulesetId: 'srd-cc-5.2.1' as const,
      source: 'system' as const,
      status: 'published' as const,
      campaignId: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      name: 'Rope',
      description: '',
      cost: { amount: 2, currency: 'gp' as const },
      weight: { value: 5, unit: 'lb' as const },
      kind: 'adventuring_gear' as const,
      gearKind: 'general' as const,
    }

    const storedFighterWithEquipment = {
      ...builderTestContext.catalog.classes[0]!,
      characterCreation: {
        proficiencies: {
          skills: {
            choices: [{ id: 'class-skills', choose: 1, from: ['athletics'] }],
          },
        },
        startingEquipment: {
          choose: 1,
          options: [
            {
              id: 'pack-a',
              label: 'Pack A',
              items: [],
              wealth: { gp: 10 },
            },
          ],
        },
      },
    }

    const context = {
      ...builderTestContext,
      catalog: {
        ...builderTestContext.catalog,
        classes: [storedFighterWithEquipment],
        equipment: [...builderTestContext.catalog.equipment, rope],
      },
    }

    const input = finalizePcCharacterBuild(
      makeCompleteDraft({
        class: { classId: storedFighterWithEquipment.id, level: 1 },
        choiceSelections: {
          'class:srd-cc-5.2.1:fighter:starting-equipment': ['pack-a'],
        },
        equipment: {
          mode: 'package',
          purchases: [
            { equipmentId: rope.id, quantity: 1, sourceMode: 'startingGold', origin: 'picker' },
          ],
          removedPackageItemKeys: [],
          customized: true,
        },
      }),
      context,
      {
        resolvedChoiceSets: [
          {
            id: 'class:srd-cc-5.2.1:fighter:starting-equipment',
            sourceType: 'class',
            sourceId: 'srd-cc-5.2.1:fighter',
            choiceType: 'equipment',
            label: 'Choose Starting Equipment',
            min: 1,
            max: 1,
            options: [{ id: 'pack-a', label: 'Pack A' }],
            required: true,
          },
        ],
      },
    )

    expect(input.wealth).toEqual({ cp: 0, sp: 0, gp: 8, pp: 0 })
    expect(input.equipment.gear).toEqual([
      {
        equipmentId: rope.id,
        quantity: 1,
        sources: [
          { kind: 'startingGold', sourceId: storedFighterWithEquipment.id, grantId: 'pack-a' },
        ],
      },
    ])
  })

  it('assembles class spellcasting with classSpellcasting provenance', () => {
    const draft = makeCompleteDraft({
      species: { speciesId: 'srd-cc-5.2.1:fixture-dwarf' },
      class: { classId: wizardClass.id, level: 1 },
    })
    const choiceSets = resolveAvailableChoices(draft, spellcastingTestContext)
    const cantripIds = wizardCantrips.slice(0, 3).map((spell) => spell.id)
    const spellIds = wizardLevelOneSpells.slice(0, 4).map((spell) => spell.id)

    const input = finalizePcCharacterBuild(
      {
        ...draft,
        choiceSelections: {
          'class:srd-cc-5.2.1:fixture-wizard:class-skills': [`${wizardClass.rulesetId}:athletics`],
          [`spellcasting:${wizardClass.id}:cantrips`]: cantripIds,
          [`spellcasting:${wizardClass.id}:spells`]: spellIds,
        },
      },
      spellcastingTestContext,
      { resolvedChoiceSets: choiceSets },
    )

    expect(input.spells).toHaveLength(7)
    expect(input.spells?.filter((entry) => entry.selection === undefined)).toHaveLength(3)
    expect(input.spells?.filter((entry) => entry.selection?.prepared === true)).toHaveLength(4)
    expect(input.spells?.[0]?.sources).toEqual([
      {
        kind: 'classSpellcasting',
        sourceId: wizardClass.id,
        grantId: 'cantrips',
      },
    ])
    expect(input.spells?.[3]?.sources).toEqual([
      {
        kind: 'classSpellcasting',
        sourceId: wizardClass.id,
        grantId: 'spells',
      },
    ])
  })
})
