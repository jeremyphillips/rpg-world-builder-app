import { describe, expect, it } from 'vitest'

import { languageGrantItemsField } from './language-grant-form-fields'

describe('languageGrantItemsField', () => {
  it('uses a searchable multi-select language combobox', () => {
    expect(
      languageGrantItemsField({
        path: 'languageProficiencyGrants.items',
        label: 'Granted languages',
        languageOptions: [{ value: 'common', label: 'Common' }],
      }),
    ).toMatchObject({
      type: 'combobox',
      name: 'languageProficiencyGrants.items',
      multiple: true,
      enableSearch: true,
      labelVisibility: 'srOnly',
      separator: 'subtle',
      hint: 'Characters receive these languages:',
    })
  })
})
