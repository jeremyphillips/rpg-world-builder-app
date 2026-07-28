import { describe, expect, it } from 'vitest'

import { createEmptyCharacterBuilderDraft } from '@rpg/contracts'

import {
  buildHeritageSelectionPatch,
  buildSpeciesSelectionPatch,
  clearSpeciesScopedChoiceSelections,
} from './species-selection.lib'

describe('species-selection.lib', () => {
  it('clears species-scoped choice selections', () => {
    expect(
      clearSpeciesScopedChoiceSelections({
        'species:srd-cc-5.2.1:elf:heritage': ['drow'],
        'class:srd-cc-5.2.1:fighter:skills': ['athletics'],
      }),
    ).toEqual({
      'class:srd-cc-5.2.1:fighter:skills': ['athletics'],
    })
  })

  it('buildSpeciesSelectionPatch clears heritage and species choice keys on species swap', () => {
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      species: {
        speciesId: 'srd-cc-5.2.1:elf',
        heritageId: 'drow',
      },
      choiceSelections: {
        'species:srd-cc-5.2.1:elf:heritage': ['drow'],
        'class:srd-cc-5.2.1:fighter:skills': ['athletics'],
      },
    }

    expect(buildSpeciesSelectionPatch(draft, 'srd-cc-5.2.1:dwarf')).toEqual({
      species: {
        speciesId: 'srd-cc-5.2.1:dwarf',
        heritageId: undefined,
      },
      choiceSelections: {
        'class:srd-cc-5.2.1:fighter:skills': ['athletics'],
      },
    })
  })

  it('buildHeritageSelectionPatch syncs choiceSelections and heritageId', () => {
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      species: {
        speciesId: 'srd-cc-5.2.1:elf',
      },
    }

    expect(buildHeritageSelectionPatch(draft, 'species:srd-cc-5.2.1:elf:heritage', 'drow')).toEqual(
      {
        choiceSelections: {
          'species:srd-cc-5.2.1:elf:heritage': ['drow'],
        },
        species: {
          speciesId: 'srd-cc-5.2.1:elf',
          heritageId: 'drow',
        },
      },
    )
  })
})
