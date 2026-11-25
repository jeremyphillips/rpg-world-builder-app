import { describe, expect, it } from 'vitest'

import { FORM_VALIDATION_ADOPTED_FAMILIES } from './form-validation-adopted-families'
import { FORM_VALIDATION_ADOPTION_ALLOWLIST } from './form-validation-adoption-allowlist'

describe('form validation phase 6 exit', () => {
  it('records initial adoption families', () => {
    const ids = FORM_VALIDATION_ADOPTED_FAMILIES.map((entry) => entry.id)
    expect(ids).toEqual(['content-hub', 'campaign', 'public-auth', 'content-master-detail'])
  })

  it('defers only phase 7 workflows on the allowlist', () => {
    for (const entry of FORM_VALIDATION_ADOPTION_ALLOWLIST) {
      expect(entry.removesIn.startsWith('phase-7-')).toBe(true)
    }
    expect(FORM_VALIDATION_ADOPTION_ALLOWLIST.map((e) => e.id)).toEqual([
      'character-builder',
      'character-import',
      'quick-npc',
    ])
  })
})
