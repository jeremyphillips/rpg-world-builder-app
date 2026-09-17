import { describe, expect, it } from 'vitest'

import {
  clearingFieldsHaveContent,
  collectDependentClearingFieldNames,
  fieldValueHasClearableContent,
  resolveClearingFieldValue,
  shouldConfirmBeforeClear,
} from './confirm-before-clear.lib'

describe('confirm-before-clear.lib', () => {
  const richtextField = {
    type: 'richtext' as const,
    name: 'cantripScaling',
    label: 'Cantrip Upgrade',
  }

  it('collects dependent leaf field names', () => {
    expect(
      collectDependentClearingFieldNames([
        {
          type: 'richtext',
          name: 'cantripScaling',
          label: 'Cantrip Upgrade',
        },
      ]),
    ).toEqual(['cantripScaling'])
  })

  it('treats empty rich text as no clearable content', () => {
    expect(fieldValueHasClearableContent(richtextField, '<p></p>')).toBe(false)
    expect(fieldValueHasClearableContent(richtextField, '<p>At 5th level…</p>')).toBe(true)
  })

  it('resolves prefixed clearing values', () => {
    expect(
      resolveClearingFieldValue(
        { spell: { cantripScaling: '<p>Upgrade</p>' } },
        'spell',
        'cantripScaling',
      ),
    ).toBe('<p>Upgrade</p>')
  })

  it('returns false when no clearing fields have content', () => {
    expect(clearingFieldsHaveContent([richtextField], { cantripScaling: '<p></p>' })).toBe(false)
  })

  it('uses custom shouldConfirm when provided', () => {
    expect(
      shouldConfirmBeforeClear(
        {
          headline: 'Remove?',
          shouldConfirm: () => false,
        },
        { cantripScaling: '<p>Upgrade</p>' },
        { clearingFieldNames: ['cantripScaling'] },
        [richtextField],
      ),
    ).toBe(false)
  })
})
