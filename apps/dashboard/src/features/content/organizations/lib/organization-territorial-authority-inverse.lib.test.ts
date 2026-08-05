import { describe, expect, it } from 'vitest'

import { canEditOrganizationTerritorialAuthorityInverse } from './organization-territorial-authority-inverse.lib'

describe('organization territorial authority inverse helpers', () => {
  it('requires campaign manage role and registry inverse write capability', () => {
    expect(canEditOrganizationTerritorialAuthorityInverse(true)).toBe(true)
    expect(canEditOrganizationTerritorialAuthorityInverse(false)).toBe(false)
  })
})
