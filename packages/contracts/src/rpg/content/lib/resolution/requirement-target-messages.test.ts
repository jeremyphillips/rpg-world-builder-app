import { describe, expect, it } from 'vitest'

import { getRequirementTargetIncompatibility } from './requirement-target-compatibility'
import {
  formatRequirementTargetIncompatibilityMessage,
  RESOLUTION_REQUIREMENT_CREATURE_ONLY_VALIDATION,
} from './requirement-target-messages'

describe('requirement target messages', () => {
  it('uses shared creature-only validation copy for every incompatible requirement', () => {
    const reason = getRequirementTargetIncompatibility({ kind: 'sight', who: 'target' }, 'object')
    expect(reason).toBeDefined()
    if (!reason) return

    expect(formatRequirementTargetIncompatibilityMessage(reason, 'validation')).toBe(
      RESOLUTION_REQUIREMENT_CREATURE_ONLY_VALIDATION,
    )
    expect(RESOLUTION_REQUIREMENT_CREATURE_ONLY_VALIDATION).toBe(
      'Only applies to creatures. Select Creature targeting or remove this requirement.',
    )
  })
})
