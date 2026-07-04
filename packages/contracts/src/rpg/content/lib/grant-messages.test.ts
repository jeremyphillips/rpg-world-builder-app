import { describe, expect, it } from 'vitest'

import { formatFieldMessage } from '../../../validation/define-message'
import { grantValidationMessages } from './grant-messages'

describe('grantValidationMessages', () => {
  it.each([
    [
      'frequencyNotAllowedAlwaysPrepared',
      formatFieldMessage(grantValidationMessages.frequencyNotAllowedAlwaysPrepared()),
      'Cast frequency does not apply to always-prepared spells.',
    ],
    [
      'languageChoicePoolRequired',
      formatFieldMessage(grantValidationMessages.languageChoicePoolRequired()),
      'Choose specific languages or language categories for this grant.',
    ],
    [
      'fixedProficiencyRequiresTarget',
      formatFieldMessage(grantValidationMessages.fixedProficiencyRequiresTarget()),
      'Add at least one specific item or category.',
    ],
    [
      'categoryFilterWrongKind',
      formatFieldMessage(
        grantValidationMessages.categoryFilterWrongKind({
          filterLabel: 'Tool category',
          equipmentKindLabel: 'Weapon',
        }),
      ),
      'Tool category filters only apply to Weapon equipment.',
    ],
  ])('%s formats user-facing copy', (_name, actual, expected) => {
    expect(actual).toBe(expected)
  })
})
