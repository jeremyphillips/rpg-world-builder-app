import { describe, expect, it } from 'vitest'

import { organizationFormValueSyncs } from './organization-form-sync'

describe('organizationFormValueSyncs', () => {
  const kindSync = organizationFormValueSyncs[0]!

  it('clears subtype when incompatible with the new kind', () => {
    expect(
      kindSync.apply({ organizationKind: 'military', organizationSubtype: 'monarchy' }, [
        'organizationKind',
      ]),
    ).toEqual({ organizationSubtype: undefined })
  })

  it('leaves a still-valid subtype untouched', () => {
    expect(
      kindSync.apply({ organizationKind: 'government', organizationSubtype: 'monarchy' }, [
        'organizationKind',
      ]),
    ).toBeUndefined()
  })

  it('clears subtype when kind is unset', () => {
    expect(
      kindSync.apply({ organizationKind: '', organizationSubtype: 'monarchy' }, [
        'organizationKind',
      ]),
    ).toEqual({ organizationSubtype: undefined })
  })
})
