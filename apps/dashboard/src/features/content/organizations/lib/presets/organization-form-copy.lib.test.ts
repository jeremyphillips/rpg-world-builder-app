import { describe, expect, it } from 'vitest'

import { organizationChangeStartingPointDialogBody } from './organization-form-copy.lib'

describe('organizationChangeStartingPointDialogBody', () => {
  it('names a single customized overwrite field and membership titles separately', () => {
    expect(organizationChangeStartingPointDialogBody('Academy', ['Domain'])).toBe(
      'Applying Academy will replace your change to Domain. Membership titles will also use Academy defaults.',
    )
  })

  it('lists multiple overwrite fields with an Oxford comma', () => {
    expect(
      organizationChangeStartingPointDialogBody('Academy', ['Domain', 'Practices', 'Classes']),
    ).toBe(
      'Applying Academy will replace your changes to Domain, Practices, and Classes. Membership titles will also use Academy defaults.',
    )
  })
})
