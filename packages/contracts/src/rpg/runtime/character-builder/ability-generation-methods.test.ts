import { describe, expect, it } from 'vitest'

import {
  getAbilityGenerationMethodAssignmentDescription,
  getAbilityGenerationMethodDisplayName,
} from './ability-generation-methods'

describe('ability-generation-methods', () => {
  it('returns display names for known methods', () => {
    expect(getAbilityGenerationMethodDisplayName('standard-array')).toBe('Fixed scores')
    expect(getAbilityGenerationMethodDisplayName('manual')).toBe('Custom scores')
    expect(getAbilityGenerationMethodDisplayName(undefined)).toBe('Not set')
  })

  it('returns assignment description for fixed-score methods', () => {
    expect(getAbilityGenerationMethodAssignmentDescription('standard-array')).toBe(
      'Drag each score onto an ability, or choose scores manually.',
    )
    expect(getAbilityGenerationMethodAssignmentDescription('manual')).toBeUndefined()
  })
})
