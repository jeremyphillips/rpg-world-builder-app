import { describe, expect, it } from 'vitest'

import type { Species } from '../../../content/species'
import { createEmptyCharacterBuilderDraft } from '../draft'
import { indexCharacterBuildCatalog } from '../context'
import { assembleGrantSkillProficiencyEntries } from './assemble-grant-proficiencies'
import { resolveSpeciesTraitGrantChoiceSets } from '../resolvers/species/resolve-species-trait-grant-choice-sets'
import { assembleSkillProficiencyEntries } from './assemble-skill-proficiencies'
import { stealthSkill, proficiencyTestCatalog } from '../proficiency-test-fixtures'

const speciesWithSkillGrant = {
  id: 'srd-cc-5.2.1:elf',
  slug: 'elf',
  rulesetId: 'srd-cc-5.2.1',
  source: 'system',
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
      grantGroups: [
        {
          grants: [
            {
              kind: 'skillProficiency',
              grant: { kind: 'fixed', skillIds: ['perception'] },
            },
          ],
        },
      ],
    },
    {
      kind: 'custom',
      id: 'elf-training',
      name: 'Elf Training',
      grantGroups: [
        {
          grants: [
            {
              kind: 'skillProficiency',
              grant: { kind: 'choice', choose: 1, pool: { source: 'any' } },
            },
          ],
        },
      ],
    },
  ],
} as const satisfies Species

const catalog = {
  ...proficiencyTestCatalog,
  species: [speciesWithSkillGrant],
}

describe('assembleGrantSkillProficiencyEntries', () => {
  const catalogIndex = indexCharacterBuildCatalog(catalog)

  it('finalizes fixed species trait skill grants with provenance', () => {
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      species: { speciesId: speciesWithSkillGrant.id },
    }

    expect(assembleGrantSkillProficiencyEntries(draft, catalogIndex)).toEqual([
      {
        skill: 'perception',
        rank: 'proficient',
        sources: [
          {
            kind: 'speciesTrait',
            sourceId: speciesWithSkillGrant.id,
            grantId: 'keen-senses',
          },
        ],
      },
    ])
  })

  it('finalizes species trait ChoiceSet selections with species provenance', () => {
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      species: { speciesId: speciesWithSkillGrant.id },
    }
    const choiceSets = resolveSpeciesTraitGrantChoiceSets(draft, catalogIndex)
    const skillChoiceSet = choiceSets.find(
      (choiceSet) => choiceSet.choiceType === 'skillProficiency',
    )

    const draftWithSelection = {
      ...draft,
      choiceSelections: {
        [skillChoiceSet!.id]: [stealthSkill.id],
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
            grantId: 'keen-senses',
          },
        ],
      },
      {
        skill: 'stealth',
        rank: 'proficient',
        sources: [
          {
            kind: 'speciesTrait',
            sourceId: speciesWithSkillGrant.id,
            grantId: skillChoiceSet!.id,
          },
        ],
      },
    ])
  })
})
