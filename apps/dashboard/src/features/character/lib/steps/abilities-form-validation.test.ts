import { describe, it } from 'vitest'
import { ABILITY_GENERATION_METHODS } from '@rpg/contracts'
import {
  assertFieldPathsRegistered,
  assertInvalidSubmitUsesRefinedMessages,
  assertRegistryCoverage,
} from '@rpg/ui/form/test-utils'

import { abilitiesFormSchema, buildAbilitiesValidationFields } from './abilities-form-fields'

const SLOT_IGNORE = [/^fixedScoresAssignment/, /^_/] as const

describe('abilities form validation', () => {
  for (const method of ABILITY_GENERATION_METHODS) {
    it(`${method} registers schema paths and uses refined submit messages`, () => {
      const fields = buildAbilitiesValidationFields(method)

      assertFieldPathsRegistered(fields)
      assertRegistryCoverage(abilitiesFormSchema, fields, { ignorePaths: SLOT_IGNORE })
      assertInvalidSubmitUsesRefinedMessages(abilitiesFormSchema, fields)
    })
  }
})
