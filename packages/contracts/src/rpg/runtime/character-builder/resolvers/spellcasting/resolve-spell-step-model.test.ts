import { describe, expect, it } from 'vitest'

import { classSchema, type ClassStored } from '../../../../content/classes/class'
import type { Spell } from '../../../../content/spell'
import { createEmptyCharacterBuilderDraft } from '../../draft/draft'
import type { CharacterBuilderDraft } from '../../draft/draft'
import { indexCharacterBuildCatalog } from '../../context'
import { resolveSpellcastingProfile } from './builder-spellcasting'
import { resolveSpellcastingChoices } from './resolve-spellcasting-choices'
import { resolveSpellStepModel } from './resolve-spell-step-model'
import { spellcastingChoiceSetId } from './resolve-spellcasting-choice-sets'
import {
  highLevelWizardSpell,
  RULESET,
  spellcastingTestContext,
  testSpecies,
  wizardClass,
  wizardLevelOneSpells,
} from '../../spellcasting-test-fixtures'

function draftWith(overrides: Partial<CharacterBuilderDraft>): CharacterBuilderDraft {
  return { ...createEmptyCharacterBuilderDraft(), ...overrides }
}

const highElfSpecies = {
  ...testSpecies,
  id: `${RULESET}:elf`,
  slug: 'elf',
  name: 'Elf',
  heritage: {
    id: 'elven-lineage',
    name: 'Elven Lineage',
    choose: 1,
    options: [
      {
        kind: 'custom' as const,
        id: 'high-elf',
        name: 'High Elf',
        grantGroups: [
          {
            grants: [
              {
                kind: 'spells' as const,
                ability: 'int' as const,
                spellIds: ['prestidigitation'],
                casting: { mode: 'free_cast' as const, frequency: 'at_will' as const },
              },
            ],
          },
          {
            unlock: { level: 3 },
            grants: [
              {
                kind: 'spells' as const,
                ability: 'int' as const,
                spellIds: ['detect-magic'],
                casting: {
                  mode: 'free_cast' as const,
                  frequency: 'once_per_long_rest' as const,
                },
              },
            ],
          },
          {
            unlock: { level: 5 },
            grants: [
              {
                kind: 'spells' as const,
                ability: 'int' as const,
                spellIds: ['misty-step'],
                casting: {
                  mode: 'free_cast' as const,
                  frequency: 'once_per_long_rest' as const,
                },
              },
            ],
          },
        ],
      },
    ],
  },
}

function heritageSpell(slug: string, level: number, name: string): Spell {
  return {
    id: `${RULESET}:${slug}`,
    slug,
    rulesetId: RULESET,
    source: 'system',
    status: 'published',
    campaignId: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    name,
    description: '<p>Test spell.</p>',
    school: 'evocation',
    level,
    classIds: ['fixture-wizard'],
    castingTime: { normal: { value: 1, unit: 'action' }, canBeCastAsRitual: false },
    range: { kind: 'self' },
    duration: { kind: 'instantaneous' },
    components: { verbal: true },
  }
}

describe('resolveSpellStepModel', () => {
  const catalogIndex = indexCharacterBuildCatalog(spellcastingTestContext.catalog)

  it('keeps global quotas on choice blocks and defers wizard prepared from level tabs', () => {
    const draft = draftWith({
      class: { classId: wizardClass.id, level: 1 },
      choiceSelections: {
        [spellcastingChoiceSetId(wizardClass.id, 'spellbook')]: wizardLevelOneSpells.map(
          (spell) => spell.id,
        ),
      },
    })
    const profile = resolveSpellcastingProfile(draft, spellcastingTestContext)!
    const choiceSets = resolveSpellcastingChoices(draft, spellcastingTestContext, catalogIndex)

    const model = resolveSpellStepModel({
      draft,
      context: spellcastingTestContext,
      preview: null,
      profile,
      choiceSets,
    })

    expect(model.deferredPreparedSection?.kind).toBe('deferredPrepared')
    expect(model.acquisitionHeader).toBeNull()
    expect(model.spellLevelSections).toHaveLength(1)
    expect(model.spellLevelSections[0]?.aggregateCount).toEqual({
      selected: 6,
      max: 6,
      label: '6 / 6 learned',
      verb: 'learned',
      requiredToComplete: true,
      effectiveRequiredCount: 6,
    })
    expect(model.spellLevelSections[0]?.subheadLines?.[0]).toMatch(/^Learn 6 spells/)
    expect(model.spellLevelSections[0]?.identityLine).toBeUndefined()
    expect(model.levelTabs[0]).toEqual({
      level: 1,
      selectedAtLevel: 6,
      activityLabel: '6 selected',
    })
  })

  it('uses tab activity labels per level and scopes section counters to the active level', () => {
    const draft = draftWith({
      class: { classId: wizardClass.id, level: 5 },
      choiceSelections: {
        [spellcastingChoiceSetId(wizardClass.id, 'spellbook')]: [
          wizardLevelOneSpells[0]!.id,
          wizardLevelOneSpells[1]!.id,
          highLevelWizardSpell.id,
        ],
      },
    })
    const profile = resolveSpellcastingProfile(draft, spellcastingTestContext)!
    const choiceSets = resolveSpellcastingChoices(draft, spellcastingTestContext, catalogIndex)

    const model = resolveSpellStepModel({
      draft,
      context: spellcastingTestContext,
      preview: null,
      profile,
      choiceSets,
    })

    expect(model.levelTabs).toHaveLength(profile.maxSelectableSpellLevel)
    expect(model.acquisitionHeader).toEqual(
      expect.objectContaining({
        heading: '1st–3rd-Level Spells',
        aggregateCount: expect.objectContaining({
          selected: 3,
          max: 6,
          label: '3 / 6 learned',
          verb: 'learned',
        }),
      }),
    )
    expect(model.levelTabs).toEqual([
      { level: 1, selectedAtLevel: 2, activityLabel: '2 selected' },
      { level: 2, selectedAtLevel: 0, activityLabel: 'No options' },
      { level: 3, selectedAtLevel: 1, activityLabel: '1 selected' },
    ])
    expect(model.spellLevelSections[0]?.aggregateCount).toBeNull()
    expect(model.spellLevelSections[0]?.choiceBlocks[0]?.displayCount).toEqual({
      selected: 2,
      max: 6,
    })
    expect(model.spellLevelSections[0]?.choiceBlocks[0]?.selectedCount).toBe(3)
    expect(model.spellLevelSections[0]?.choiceBlocks[0]?.isInteractive).toBe(true)
    expect(model.spellLevelSections[1]?.levelSliceEmptyMessage).toBe(
      'No 2nd-level spells are currently available for this class.',
    )
    expect(model.spellLevelSections[1]?.choiceBlocks).toEqual([])
    expect(model.spellLevelSections[1]?.subhead).toBe('')
    expect(model.spellLevelSections[1]?.identityLine).toBeUndefined()
    expect(model.spellLevelSections[2]?.aggregateCount).toBeNull()
    expect(model.spellLevelSections[2]?.choiceBlocks[0]?.isInteractive).toBe(true)
  })

  it('emits icon-backed summary rows without preparation', () => {
    const draft = draftWith({
      class: { classId: wizardClass.id, level: 1 },
    })
    const profile = resolveSpellcastingProfile(draft, spellcastingTestContext)!
    const choiceSets = resolveSpellcastingChoices(draft, spellcastingTestContext, catalogIndex)

    const model = resolveSpellStepModel({
      draft,
      context: spellcastingTestContext,
      preview: null,
      profile,
      choiceSets,
    })

    expect(model.summaryRows.map((row) => row.id)).toEqual(['ability', 'save-dc', 'attack'])
    expect(model.summaryRows.every((row) => row.icon)).toBe(true)
    expect(model.summaryRows.find((row) => row.id === 'attack')?.label).toBe(
      'Spell attack modifier',
    )
    expect(model.summaryRows.find((row) => row.id === 'save-dc')?.value).toBeUndefined()
    expect(model.summaryRows.find((row) => row.id === 'save-dc')?.unsetText).toBe(
      'Calculated after ability scores',
    )
    expect(model.summaryRows.find((row) => row.id === 'attack')?.unsetText).toBe(
      'Calculated after ability scores',
    )
  })

  it('places High Elf heritage grants in cantrip and spell-level sections by unlock level', () => {
    const heritageSpells = [
      heritageSpell('prestidigitation', 0, 'Prestidigitation'),
      heritageSpell('detect-magic', 1, 'Detect Magic'),
      heritageSpell('misty-step', 2, 'Misty Step'),
    ]
    const context = {
      ...spellcastingTestContext,
      catalog: {
        ...spellcastingTestContext.catalog,
        species: [highElfSpecies],
        spells: [...spellcastingTestContext.catalog.spells, ...heritageSpells],
      },
    }
    const indexedCatalog = indexCharacterBuildCatalog(context.catalog)

    const draftL1 = draftWith({
      class: { classId: wizardClass.id, level: 1 },
      species: { speciesId: highElfSpecies.id, heritageId: 'high-elf' },
    })
    const profileL1 = resolveSpellcastingProfile(draftL1, context)!
    const choiceSetsL1 = resolveSpellcastingChoices(draftL1, context, indexedCatalog)
    const modelL1 = resolveSpellStepModel({
      draft: draftL1,
      context,
      preview: null,
      profile: profileL1,
      choiceSets: choiceSetsL1,
    })

    expect(modelL1.cantripsSection?.grantedRows.map((row) => row.label)).toEqual([
      'Prestidigitation',
    ])
    expect(modelL1.cantripsSection?.grantedRows[0]?.sourceLabel).toBe(
      'Granted by High Elf · Elven Lineage',
    )
    expect(modelL1.spellLevelSections[0]?.grantedRows).toEqual([])

    const draftL3 = draftWith({
      class: { classId: wizardClass.id, level: 3 },
      species: { speciesId: highElfSpecies.id, heritageId: 'high-elf' },
    })
    const profileL3 = resolveSpellcastingProfile(draftL3, context)!
    const choiceSetsL3 = resolveSpellcastingChoices(draftL3, context, indexedCatalog)
    const modelL3 = resolveSpellStepModel({
      draft: draftL3,
      context,
      preview: null,
      profile: profileL3,
      choiceSets: choiceSetsL3,
    })

    expect(modelL3.spellLevelSections[0]?.grantedRows.map((row) => row.label)).toEqual([
      'Detect Magic',
    ])
    expect(modelL3.spellLevelSections[0]?.grantedRows[0]?.sourceLabel).toBe(
      'Granted by High Elf · Elven Lineage',
    )

    const draftL5 = draftWith({
      class: { classId: wizardClass.id, level: 5 },
      species: { speciesId: highElfSpecies.id, heritageId: 'high-elf' },
    })
    const profileL5 = resolveSpellcastingProfile(draftL5, context)!
    const choiceSetsL5 = resolveSpellcastingChoices(draftL5, context, indexedCatalog)
    const modelL5 = resolveSpellStepModel({
      draft: draftL5,
      context,
      preview: null,
      profile: profileL5,
      choiceSets: choiceSetsL5,
    })

    expect(modelL5.spellLevelSections[1]?.grantedRows.map((row) => row.label)).toEqual([
      'Misty Step',
    ])
  })

  it('uses grant-card provenance labels for class feature spell grants', () => {
    const rangerStored = {
      id: `${RULESET}:fixture-ranger`,
      slug: 'fixture-ranger',
      rulesetId: RULESET,
      source: 'system',
      status: 'published',
      campaignId: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      name: 'Ranger',
      description: '<p>Wilderness warrior.</p>',
      primaryAbilities: ['dex', 'wis'],
      hitDie: 10,
      proficiencies: {
        savingThrows: ['str', 'dex'],
        armor: { categories: ['light', 'medium', 'shields'], items: [] },
        weapons: { categories: ['simple', 'martial'], items: [] },
        skills: { categories: [], items: [] },
      },
      characterCreation: {
        proficiencies: {
          skills: {
            choices: [{ id: 'class-skills', choose: 1, from: ['athletics'] }],
          },
        },
      },
      features: [
        {
          kind: 'custom',
          id: 'spellcasting',
          name: 'Spellcasting',
          level: 1,
          grantGroups: [{ grants: [{ kind: 'spellcasting' }] }],
        },
        {
          kind: 'custom',
          id: 'favored-enemy',
          name: 'Favored Enemy',
          level: 1,
          grantGroups: [
            {
              grants: [
                {
                  kind: 'spells',
                  ability: 'wis',
                  spellIds: ['hunters-mark'],
                  availability: 'always_prepared',
                  casting: {
                    mode: 'free_cast',
                    frequency: 'prof_bonus_per_long_rest',
                  },
                },
              ],
            },
          ],
        },
      ],
      spellcasting: {
        slotProgressionId: 'half-caster',
        ability: 'wis',
        spellSelection: {
          model: 'limitedRepertoire',
          change: { kind: 'replace', trigger: 'longRest', limit: 1 },
        },
        progression: {
          repertoire: {
            curve: { rows: [{ level: 1, count: 2 }] },
            extension: 'carryForward',
          },
        },
      },
    } satisfies ClassStored
    const rangerClass = classSchema.parse(rangerStored)
    const huntersMark = heritageSpell('hunters-mark', 1, "Hunter's Mark")
    const context = {
      ...spellcastingTestContext,
      catalog: {
        ...spellcastingTestContext.catalog,
        classes: [...spellcastingTestContext.catalog.classes, rangerClass],
        spells: [...spellcastingTestContext.catalog.spells, huntersMark],
      },
    }
    const indexedCatalog = indexCharacterBuildCatalog(context.catalog)
    const draft = draftWith({
      class: { classId: rangerClass.id, level: 1 },
    })
    const profile = resolveSpellcastingProfile(draft, context)!
    const choiceSets = resolveSpellcastingChoices(draft, context, indexedCatalog)
    const model = resolveSpellStepModel({
      draft,
      context,
      preview: null,
      profile,
      choiceSets,
    })

    expect(model.spellLevelSections[0]?.grantedRows).toEqual([
      {
        id: `granted-spell:${huntersMark.id}`,
        label: "Hunter's Mark",
        sourceLabel: 'Granted by Favored Enemy · Ranger feature',
      },
    ])
  })
})
