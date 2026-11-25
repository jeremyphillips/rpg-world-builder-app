import { describe, expect, it } from 'vitest'

import { FORM_VALIDATION_ADOPTED_FAMILIES } from './form-validation-adopted-families'
import { FORM_VALIDATION_ADOPTION_ALLOWLIST } from './form-validation-adoption-allowlist'

describe('form validation phase 6 exit', () => {
  it('records initial adoption families', () => {
    const ids = FORM_VALIDATION_ADOPTED_FAMILIES.map((entry) => entry.id)
    expect(ids).toEqual([
      'content-hub',
      'campaign',
      'public-auth',
      'content-master-detail',
      'quick-npc',
    ])
  })

  it('recorded phase 6 deferrals cleared by phase 8', () => {
    expect(FORM_VALIDATION_ADOPTION_ALLOWLIST).toEqual([])
  })
})
