import { CREATURE_TYPE_TERM } from '@rpg/contracts'
import { describe, expect, it } from 'vitest'

import {
  VOCABULARY_COMBOBOX_PLACEHOLDER,
  vocabularyComboboxField,
  vocabularyComboboxFieldForTerm,
  vocabularySelectField,
  vocabularySelectFieldForTerm,
} from './field-factories'

const options = [
  { value: 'humanoid', label: 'Humanoid' },
  { value: 'fey', label: 'Fey' },
]

describe('vocabulary field factories', () => {
  it('builds a select field from vocabulary options', () => {
    expect(
      vocabularySelectField({
        name: 'creatureType',
        label: 'Creature type',
        options,
        required: true,
        width: 'lg',
      }),
    ).toEqual({
      type: 'select',
      name: 'creatureType',
      label: 'Creature type',
      options,
      required: true,
      width: 'lg',
    })
  })

  it('builds a combobox field with default placeholder', () => {
    expect(
      vocabularyComboboxField({
        name: 'allowedCharacterCreatureTypes',
        label: 'Allowed creature types',
        options,
        multiple: true,
        required: true,
      }),
    ).toEqual({
      type: 'combobox',
      name: 'allowedCharacterCreatureTypes',
      label: 'Allowed creature types',
      options,
      multiple: true,
      required: true,
      placeholder: VOCABULARY_COMBOBOX_PLACEHOLDER,
    })
  })

  it('allows combobox placeholder override', () => {
    expect(
      vocabularyComboboxField({
        name: 'damageTypes',
        label: 'Damage types',
        options,
        placeholder: 'Choose damage types…',
      }).placeholder,
    ).toBe('Choose damage types…')
  })

  it('defaults select field copy from a taxonomy term', () => {
    expect(
      vocabularySelectFieldForTerm(CREATURE_TYPE_TERM, {
        name: 'creatureType',
        options,
        required: true,
        width: 'lg',
      }),
    ).toEqual({
      type: 'select',
      name: 'creatureType',
      label: 'Creature type',
      placeholder: 'Choose a creature type…',
      options,
      required: true,
      width: 'lg',
    })
  })

  it('defaults combobox field copy from a taxonomy term', () => {
    expect(
      vocabularyComboboxFieldForTerm(CREATURE_TYPE_TERM, {
        name: 'allowedCharacterCreatureTypes',
        options,
        multiple: true,
        required: true,
      }),
    ).toEqual({
      type: 'combobox',
      name: 'allowedCharacterCreatureTypes',
      label: 'Creature types',
      placeholder: 'Choose creature types…',
      options,
      multiple: true,
      required: true,
    })
  })
})
