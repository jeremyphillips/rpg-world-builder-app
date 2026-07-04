import { describe, expect, it } from 'vitest'

import type { IdentityFormValues } from './identity-form-fields'
import { areIdentityDraftsEqual, identityFormValuesToDraft } from './identity-form-values'

describe('identityFormValuesToDraft', () => {
  it('omits blank alignment sentinels from the draft', () => {
    const values = {
      name: 'Verna',
      description: 'Quiet and watchful.',
      alignment: '',
    } as unknown as IdentityFormValues

    expect(identityFormValuesToDraft(values)).toEqual({
      name: 'Verna',
      description: 'Quiet and watchful.',
    })
  })

  it('compares normalized identity drafts', () => {
    expect(areIdentityDraftsEqual({ name: 'Verna' }, { name: 'Verna', alignment: undefined })).toBe(
      true,
    )
    expect(areIdentityDraftsEqual({ name: 'Verna' }, { name: 'Other' })).toBe(false)
  })
})
