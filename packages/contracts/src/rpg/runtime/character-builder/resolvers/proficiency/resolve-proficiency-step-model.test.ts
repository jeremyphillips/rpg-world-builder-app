import { describe, expect, it } from 'vitest'

import { createEmptyCharacterBuilderDraft } from '../../draft/draft'
import {
  indexCharacterBuildCatalog,
  type CharacterBuildCatalog,
  type CharacterBuildContext,
} from '../../context'
import { buildCharacterPreview } from '../../preview/preview'
import { resolveAvailableChoices } from '../registry/resolve-choices'
import { resolveClassSkillChoiceSets } from '../class/resolve-class-skill-choice-sets'
import { resolveSpeciesTraitGrantChoiceSets } from '../species/resolve-species-trait-grant-choice-sets'
import { resolveProficiencyStepModel } from './resolve-proficiency-step-model'
import type { SkillProficiency } from '../../../../content/skill-proficiency'
import type { Species } from '../../../../content/species'
import {
  acrobaticsSkill,
  perceptionSkill,
  proficiencyTestCatalog,
  proficiencyTestContext,
  rogueClass,
  stealthSkill,
} from '../../proficiency-test-fixtures'

describe('resolveProficiencyStepModel', () => {
  const catalogIndex = indexCharacterBuildCatalog(proficiencyTestCatalog)
  const rules = proficiencyTestContext.characterCreationRules
  const rulesetId = proficiencyTestContext.rulesetId

  it('returns fixed grants in the summary and interactive sections for choices', () => {
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: rogueClass.id, level: 1 as const },
      choiceSelections: {},
    }
    const choiceSets = resolveAvailableChoices(draft, proficiencyTestContext)
    const preview = buildCharacterPreview(draft, catalogIndex, rules, rulesetId, {
      resolvedChoiceSets: choiceSets,
    })

    const model = resolveProficiencyStepModel({
      draft,
      context: proficiencyTestContext,
      preview,
      choiceSets,
    })

    expect(model.fixedGrants.map((row) => row.kind)).toEqual([
      'savingThrows',
      'tools',
      'languages',
      'weapons',
      'armor',
    ])

    const savingThrows = model.fixedGrants.find((row) => row.kind === 'savingThrows')
    expect(savingThrows?.sourceGroups).toEqual([
      expect.objectContaining({
        sourceLabel: 'Rogue',
        valueLabels: expect.arrayContaining(['Dexterity', 'Intelligence']),
      }),
    ])

    const tools = model.fixedGrants.find((row) => row.kind === 'tools')
    expect(tools?.sourceGroups).toEqual([
      expect.objectContaining({
        valueLabels: ['Thieves Tools'],
        sourceLabel: 'Rogue',
      }),
    ])

    const skills = model.sections.find((section) => section.kind === 'skills')
    expect(skills?.choiceBlocks).toHaveLength(1)
    expect(skills?.choiceBlocks[0]?.heading).toBe('Rogue Skills')
    expect(skills?.choiceBlocks[0]?.sourceLine).toBeUndefined()
    expect(skills?.choiceBlocks[0]?.choiceSet.label).toBe('Rogue Skills')
    expect(skills?.subhead).toBe('Choose 2 skills from Rogue Skills.')
    expect(skills?.identityLine).toBeUndefined()
    expect(skills?.aggregateCount).toEqual({
      selected: 0,
      max: 2,
      label: '0 / 2 chosen',
    })
    expect(model.hasPendingChoices).toBe(true)
    expect(model.hasUnresolvedPrerequisites).toBe(false)
  })

  it('marks stale skill selections on the selected rows', () => {
    const choiceSets = resolveClassSkillChoiceSets(
      {
        ...createEmptyCharacterBuilderDraft(),
        class: { classId: rogueClass.id, level: 1 },
      },
      catalogIndex,
    )
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: rogueClass.id, level: 1 as const },
      choiceSelections: {
        [choiceSets[0]!.id]: [stealthSkill.id, 'removed-skill'],
      },
    }
    const preview = buildCharacterPreview(draft, catalogIndex, rules, rulesetId, {
      resolvedChoiceSets: choiceSets,
    })

    const model = resolveProficiencyStepModel({
      draft,
      context: proficiencyTestContext,
      preview,
      choiceSets,
    })

    const skills = model.sections.find((section) => section.kind === 'skills')
    const staleRow = skills?.selectedRows.find((row) => row.optionId === 'removed-skill')

    expect(staleRow).toMatchObject({
      isStale: true,
      staleReason: 'This proficiency is no longer available.',
    })
    expect(skills?.selectedRows.find((row) => row.optionId === stealthSkill.id)?.isStale).toBe(
      false,
    )
  })

  it('includes selected skill rows for a class skill choice set', () => {
    const choiceSets = resolveClassSkillChoiceSets(
      {
        ...createEmptyCharacterBuilderDraft(),
        class: { classId: rogueClass.id, level: 1 },
      },
      catalogIndex,
    )
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: rogueClass.id, level: 1 as const },
      choiceSelections: {
        [choiceSets[0]!.id]: [acrobaticsSkill.id],
      },
    }
    const preview = buildCharacterPreview(draft, catalogIndex, rules, rulesetId, {
      resolvedChoiceSets: choiceSets,
    })

    const model = resolveProficiencyStepModel({
      draft,
      context: proficiencyTestContext,
      preview,
      choiceSets,
    })

    const skills = model.sections.find((section) => section.kind === 'skills')
    expect(skills?.selectedRows).toEqual([
      expect.objectContaining({
        optionId: acrobaticsSkill.id,
        label: 'Acrobatics',
        isRemovable: true,
      }),
    ])
  })

  it('flags unresolved prerequisites when class progression is blocked', () => {
    const draft = createEmptyCharacterBuilderDraft()
    const choiceSets = resolveAvailableChoices(draft, proficiencyTestContext)
    const preview = buildCharacterPreview(draft, catalogIndex, rules, rulesetId, {
      resolvedChoiceSets: choiceSets,
    })

    const model = resolveProficiencyStepModel({
      draft,
      context: proficiencyTestContext,
      preview,
      choiceSets,
    })

    expect(model.hasUnresolvedPrerequisites).toBe(true)
    expect(model.fixedGrants.some((row) => row.kind === 'savingThrows')).toBe(false)
    expect(model.sections.some((section) => section.kind === 'languages')).toBe(true)
  })

  const insightSkill = {
    id: 'srd-cc-5.2.1:insight',
    slug: 'insight',
    rulesetId: 'srd-cc-5.2.1',
    source: 'system',
    status: 'published',
    campaignId: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    name: 'Insight',
    ability: 'wis',
    examples: ['Discern intent and emotions'],
  } as const satisfies SkillProficiency

  const survivalSkill = {
    id: 'srd-cc-5.2.1:survival',
    slug: 'survival',
    rulesetId: 'srd-cc-5.2.1',
    source: 'system',
    status: 'published',
    campaignId: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    name: 'Survival',
    ability: 'wis',
    examples: ['Follow tracks and forage'],
  } as const satisfies SkillProficiency

  const humanSpecies = {
    id: 'srd-cc-5.2.1:human',
    slug: 'human',
    rulesetId: 'srd-cc-5.2.1',
    source: 'system',
    status: 'published',
    campaignId: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    name: 'Human',
    creatureType: 'humanoid',
    sizes: ['medium'],
    movement: { walk: 30 },
    languageAffinities: ['common'],
    traits: [
      {
        kind: 'custom',
        id: 'skillful',
        name: 'Skillful',
        description: '<p>Choose one skill.</p>',
        grantGroups: [
          {
            grants: [
              {
                kind: 'skillProficiency',
                grant: {
                  kind: 'choice',
                  choose: 1,
                  pool: { source: 'any' },
                },
              },
            ],
          },
        ],
      },
    ],
  } satisfies Species

  const elfSpecies = {
    id: 'srd-cc-5.2.1:elf',
    slug: 'elf',
    rulesetId: 'srd-cc-5.2.1',
    source: 'system',
    status: 'published',
    campaignId: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    name: 'Elf',
    creatureType: 'humanoid',
    sizes: ['medium'],
    movement: { walk: 30 },
    languageAffinities: ['elvish'],
    traits: [
      {
        kind: 'custom',
        id: 'keen-senses',
        name: 'Keen Senses',
        description: '<p>Choose Insight, Perception, or Survival.</p>',
        grantGroups: [
          {
            grants: [
              {
                kind: 'skillProficiency',
                grant: {
                  kind: 'choice',
                  choose: 1,
                  pool: {
                    source: 'explicit',
                    skillIds: ['insight', 'perception', 'survival'],
                  },
                },
              },
            ],
          },
        ],
      },
    ],
  } satisfies Species

  const traitCatalog: CharacterBuildCatalog = {
    ...proficiencyTestCatalog,
    species: [humanSpecies, elfSpecies],
    skillProficiencies: [
      ...proficiencyTestCatalog.skillProficiencies,
      insightSkill,
      perceptionSkill,
      survivalSkill,
    ],
  }

  it('resolves Skillful single-set supporting copy from species trait grants', () => {
    const context: CharacterBuildContext = {
      ...proficiencyTestContext,
      catalog: traitCatalog,
    }
    const catalogIndex = indexCharacterBuildCatalog(traitCatalog)
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      species: { speciesId: humanSpecies.id },
    }
    const choiceSets = resolveSpeciesTraitGrantChoiceSets(draft, catalogIndex, context)
    const preview = buildCharacterPreview(draft, catalogIndex, rules, rulesetId, {
      resolvedChoiceSets: choiceSets,
    })

    const model = resolveProficiencyStepModel({
      draft,
      context,
      preview,
      choiceSets,
    })

    const skills = model.sections.find((section) => section.kind === 'skills')
    expect(skills?.subhead).toBe('Choose any 1 skill for Skillful.')
    expect(skills?.identityLine).toBeUndefined()
    expect(skills?.choiceBlocks[0]?.sourceLine).toBe('Human species trait')
  })

  it('resolves Keen Senses single-set supporting copy with enumerated pool labels', () => {
    const context: CharacterBuildContext = {
      ...proficiencyTestContext,
      catalog: traitCatalog,
    }
    const catalogIndex = indexCharacterBuildCatalog(traitCatalog)
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      species: { speciesId: elfSpecies.id },
    }
    const choiceSets = resolveSpeciesTraitGrantChoiceSets(draft, catalogIndex, context)
    const preview = buildCharacterPreview(draft, catalogIndex, rules, rulesetId, {
      resolvedChoiceSets: choiceSets,
    })

    const model = resolveProficiencyStepModel({
      draft,
      context,
      preview,
      choiceSets,
    })

    const skills = model.sections.find((section) => section.kind === 'skills')
    expect(skills?.identityLine).toBe('Keen Senses')
    expect(skills?.subhead).toBe('Choose 1 skill from Insight, Perception, and Survival.')
    expect(skills?.choiceBlocks[0]?.sourceLine).toBe('Elf species trait')
  })
})
