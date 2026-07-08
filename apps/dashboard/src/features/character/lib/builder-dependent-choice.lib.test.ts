import { describe, expect, it } from 'vitest'

import { DEFAULT_SYSTEM_RULESET_ID, type ChoiceSet } from '@rpg/contracts'
import { listLanguageSeedOptions } from '@rpg/catalog/vocabulary'

import {
  DROW_HERITAGE_SHEET_SUMMARY_LINES,
  getDrowHeritageSpellCatalog,
} from '@/features/content/lib/fixtures/grant-display-fixtures'
import { pickSpecies } from '@/features/content/lib/fixtures/pick'

import {
  DEPENDENT_CHOICE_REQUIRED_STATUS,
  findSpeciesHeritageChoiceSet,
  mapHeritageOptionsToDependentCardOptions,
  resolveDependentChoiceSectionCopy,
} from './builder-dependent-choice.lib'

describe('builder-dependent-choice.lib', () => {
  it('resolves unresolved section copy with generic helper text', () => {
    expect(
      resolveDependentChoiceSectionCopy({
        required: true,
      }),
    ).toEqual({
      statusText: DEPENDENT_CHOICE_REQUIRED_STATUS,
      helperText: 'Choose one option.',
    })
  })

  it('resolves selected section copy without helper text', () => {
    expect(
      resolveDependentChoiceSectionCopy({
        required: false,
        selectedOptionLabel: 'Drow',
      }),
    ).toEqual({
      statusText: 'Drow selected',
      helperText: undefined,
    })
  })

  it('maps Elf heritage options to dependent card options with grant summary lines', () => {
    const languages = listLanguageSeedOptions(DEFAULT_SYSTEM_RULESET_ID)
    const elf = pickSpecies('elf')
    const options = mapHeritageOptionsToDependentCardOptions(
      elf,
      languages,
      getDrowHeritageSpellCatalog(),
    )
    const drow = options.find((option) => option.value === 'drow')

    expect(drow?.label).toBe('Drow')
    expect(drow?.summaryLines).toEqual([...DROW_HERITAGE_SHEET_SUMMARY_LINES])
  })

  it('finds the heritage choice set for a species id', () => {
    const elf = pickSpecies('elf')
    const heritageChoiceSet = {
      id: 'species:srd-cc-5.2.1:elf:heritage',
      sourceType: 'species',
      sourceId: elf.id,
      choiceType: 'trait',
      label: 'Elven Lineage',
      min: 1,
      max: 1,
      options: [],
      required: true,
    } satisfies ChoiceSet

    expect(findSpeciesHeritageChoiceSet([heritageChoiceSet], elf.id)).toBe(heritageChoiceSet)
  })
})
