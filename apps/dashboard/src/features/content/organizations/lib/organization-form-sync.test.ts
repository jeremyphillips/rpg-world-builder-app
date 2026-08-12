import { describe, expect, it } from 'vitest'

import { organizationFormValueSyncs } from './organization-form-sync'

describe('organizationFormValueSyncs', () => {
  it('keeps domain, form, and activities independent', () => {
    expect(organizationFormValueSyncs).toEqual([])
  })
})
