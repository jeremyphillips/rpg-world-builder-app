import { describe, expect, it } from 'vitest'

import { formatFieldMessage } from '../../../validation/define-message'
import { grantValidationMessages } from './grant-messages'

describe('grantValidationMessages', () => {
  it.each([
    [
      'spellsGrantRequiresAvailabilityOrCasting',
      formatFieldMessage(grantValidationMessages.spellsGrantRequiresAvailabilityOrCasting()),
      'Spell grants require availability, casting, or both.',
    ],
    [
      'spellsGrantSlotCastingRequiresAvailability',
      formatFieldMessage(grantValidationMessages.spellsGrantSlotCastingRequiresAvailability()),
      'Slot casting via a free-cast grant requires an availability entitlement.',
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
