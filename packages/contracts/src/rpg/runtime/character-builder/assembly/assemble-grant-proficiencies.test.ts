import { describe, expect, it } from 'vitest'

import type { SkillProficiency } from '../../../content/skill-proficiency'
import type { Species } from '../../../content/species'
import { createEmptyCharacterBuilderDraft } from '../draft/draft'
import { indexCharacterBuildCatalog, type CharacterBuildCatalog } from '../context'
import { assembleGrantSkillProficiencyEntries } from './assemble-grant-proficiencies'
import { resolveSpeciesTraitGrantChoiceSets } from '../resolvers/species/resolve-species-trait-grant-choice-sets'
import { createCharacterBuildContext } from '../test-fixtures'
import { assembleSkillProficiencyEntries } from './assemble-skill-proficiencies'
import { proficiencyTestCatalog, perceptionSkill } from '../proficiency-test-fixtures'

const speciesWithSkillGrant = {
  id: 'srd-cc-5.2.1:elf',
  slug: 'elf',
  rulesetId: 'srd-cc-5.2.1',
  source: 'system',
  status: 'published',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Elf',
  description: '<p>Graceful and keen.</p>',
  creatureType: 'humanoid',
  sizes: ['medium'],
  movement: { walk: 30 },
  languageAffinities: ['elvish'],
  traits: [
    {
      kind: 'custom',
      id: 'keen-senses',
      name: 'Keen Senses',
      description:
        '<p>You have proficiency in the Insight, Perception, or Survival skill (choose one).</p>',
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

const catalog: CharacterBuildCatalog = {
  ...proficiencyTestCatalog,
  species: [speciesWithSkillGrant],
  skillProficiencies: [
    ...proficiencyTestCatalog.skillProficiencies,
    insightSkill,
    perceptionSkill,
    survivalSkill,
  ],
}

describe('assembleGrantSkillProficiencyEntries', () => {
  const catalogIndex = indexCharacterBuildCatalog(catalog)

  it('does not emit fixed rows for species trait skill choice grants', () => {
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      species: { speciesId: speciesWithSkillGrant.id },
    }

    expect(assembleGrantSkillProficiencyEntries(draft, catalogIndex)).toEqual([])
  })

  it('finalizes species trait ChoiceSet selections with species provenance', () => {
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      species: { speciesId: speciesWithSkillGrant.id },
    }
    const choiceSets = resolveSpeciesTraitGrantChoiceSets(
      draft,
      catalogIndex,
      createCharacterBuildContext(),
    )
    const keenSensesChoiceSet = choiceSets.find((choiceSet) =>
      choiceSet.id.endsWith(':trait:keen-senses:skillProficiency'),
    )

    expect(keenSensesChoiceSet).toMatchObject({
      choiceType: 'skillProficiency',
      label: 'Keen Senses',
      provenance: {
        ownerKind: 'species',
        ownerLabel: 'Elf',
        featureLabel: 'Keen Senses',
      },
      min: 1,
      max: 1,
      required: true,
      options: [
        { id: 'srd-cc-5.2.1:insight', label: 'Insight' },
        { id: 'srd-cc-5.2.1:perception', label: 'Perception' },
        { id: 'srd-cc-5.2.1:survival', label: 'Survival' },
      ],
    })

    const draftWithSelection = {
      ...draft,
      choiceSelections: {
        [keenSensesChoiceSet!.id]: ['srd-cc-5.2.1:perception'],
      },
    }

    expect(
      assembleSkillProficiencyEntries(draftWithSelection, catalogIndex, choiceSets, undefined),
    ).toEqual([
      {
        skill: 'perception',
        rank: 'proficient',
        sources: [
          {
            kind: 'speciesTrait',
            sourceId: speciesWithSkillGrant.id,
            grantId: keenSensesChoiceSet!.id,
          },
        ],
      },
    ])
  })
})
