import { describe, expect, it } from 'vitest'
import { vocabularyTermFieldCopy, LANGUAGE_TERM } from '@rpg/contracts'

import {
  languageMultiComboboxField,
  languageSingleComboboxField,
} from './language-combobox-form-fields.lib'

describe('language combobox form fields', () => {
  it('builds searchable multi-select combobox fields with merged intro and hint copy', () => {
    expect(
      languageMultiComboboxField({
        name: 'languageAffinities',
        label: 'Language affinities',
        introText: 'Characters receive these languages:',
        hint: 'Does not grant languages.',
        options: [{ value: 'common', label: 'Common' }],
      }),
    ).toMatchObject({
      type: 'combobox',
      name: 'languageAffinities',
      multiple: true,
      enableSearch: true,
      hint: 'Characters receive these languages: Does not grant languages.',
      label: 'Language affinities',
    })
  })

  it('builds searchable single-select combobox fields with vocabulary defaults', () => {
    const copy = vocabularyTermFieldCopy(LANGUAGE_TERM)
    expect(
      languageSingleComboboxField({
        name: 'language',
        required: true,
        options: [{ value: 'common', label: 'Common' }],
      }),
    ).toMatchObject({
      type: 'combobox',
      name: 'language',
      multiple: false,
      enableSearch: true,
      required: true,
      label: copy.label,
      placeholder: copy.placeholder,
    })
  })
})
