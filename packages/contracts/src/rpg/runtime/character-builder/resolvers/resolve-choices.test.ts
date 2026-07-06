import { describe, expect, it } from 'vitest'

import { createEmptyCharacterBuilderDraft } from '../draft'
import type { CharacterBuilderDraft } from '../draft'
import { builderTestContext, fighterClass } from '../test-fixtures'
import { resolveAvailableChoices } from './resolve-choices'

function draftWith(overrides: Partial<CharacterBuilderDraft>): CharacterBuilderDraft {
  return { ...createEmptyCharacterBuilderDraft(), ...overrides }
}

describe('resolveAvailableChoices', () => {
  it('returns no ChoiceSets when species and class are unset', () => {
    expect(resolveAvailableChoices(createEmptyCharacterBuilderDraft(), builderTestContext)).toEqual(
      [],
    )
  })

  it('emits class skill ChoiceSet when a class with skill picks is selected', () => {
    const draft = draftWith({
      class: { classId: fighterClass.id, level: 1 },
    })

    const choiceSets = resolveAvailableChoices(draft, builderTestContext)
    const skills = choiceSets.find((choiceSet) => choiceSet.id.endsWith(':class-skills'))

    expect(skills).toMatchObject({
      id: 'class:srd-cc-5.2.1:fighter:class-skills',
      sourceType: 'class',
      choiceType: 'skillProficiency',
      min: 2,
      max: 2,
      required: true,
    })
    expect(skills?.options.length).toBeGreaterThan(0)
  })

  it('emits heritage ChoiceSet for species with heritage options', () => {
    const elf = {
      ...builderTestContext.catalog.species[0]!,
      id: 'srd-cc-5.2.1:elf',
      slug: 'elf',
      name: 'Elf',
      heritage: {
        id: 'elven-lineage',
        name: 'Elven Lineage',
        choose: 1,
        options: [
          { kind: 'custom' as const, id: 'high-elf', name: 'High Elf' },
          { kind: 'custom' as const, id: 'wood-elf', name: 'Wood Elf' },
          { kind: 'custom' as const, id: 'drow', name: 'Drow' },
        ],
      },
    }

    const context = {
      ...builderTestContext,
      catalog: {
        ...builderTestContext.catalog,
        species: [elf],
      },
    }

    const draft = draftWith({
      species: { speciesId: elf.id },
    })

    const heritage = resolveAvailableChoices(draft, context).find((choiceSet) =>
      choiceSet.id.endsWith(':heritage'),
    )

    expect(heritage).toMatchObject({
      id: 'species:srd-cc-5.2.1:elf:heritage',
      sourceType: 'species',
      choiceType: 'trait',
      min: 1,
      max: 1,
      required: true,
      options: [
        { id: 'high-elf', label: 'High Elf' },
        { id: 'wood-elf', label: 'Wood Elf' },
        { id: 'drow', label: 'Drow' },
      ],
    })
  })

  it('emits deferred feat ChoiceSets as optional advisory picks', () => {
    const human = {
      ...builderTestContext.catalog.species[0]!,
      id: 'srd-cc-5.2.1:human',
      slug: 'human',
      name: 'Human',
      traits: [
        {
          kind: 'custom' as const,
          id: 'versatile',
          name: 'Versatile',
          grantGroups: [
            {
              grants: [
                {
                  kind: 'featChoice' as const,
                  category: 'origin' as const,
                  choose: 1,
                },
              ],
            },
          ],
        },
      ],
    }

    const context = {
      ...builderTestContext,
      catalog: {
        ...builderTestContext.catalog,
        species: [human],
      },
    }

    const draft = draftWith({
      species: { speciesId: human.id },
    })

    const featChoice = resolveAvailableChoices(draft, context).find((choiceSet) =>
      choiceSet.id.includes('featChoice'),
    )

    expect(featChoice).toMatchObject({
      choiceType: 'feat',
      required: false,
      min: 1,
      max: 1,
    })
  })
})
