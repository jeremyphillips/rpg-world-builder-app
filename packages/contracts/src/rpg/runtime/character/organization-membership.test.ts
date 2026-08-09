import { describe, expect, it } from 'vitest'

import {
  createCharacterOrganizationMembershipInputSchema,
  updateCharacterOrganizationMembershipInputSchema,
} from './organization-membership'

describe('createCharacterOrganizationMembershipInputSchema', () => {
  it('accepts membership with optional title', () => {
    expect(
      createCharacterOrganizationMembershipInputSchema.parse({
        organizationId: 'organization-1',
      }),
    ).toEqual({ organizationId: 'organization-1' })

    expect(
      createCharacterOrganizationMembershipInputSchema.parse({
        organizationId: 'organization-1',
        title: '  Guildmaster  ',
      }),
    ).toEqual({ organizationId: 'organization-1', title: 'Guildmaster' })
  })
})

describe('updateCharacterOrganizationMembershipInputSchema', () => {
  it('requires title and accepts string or null', () => {
    expect(updateCharacterOrganizationMembershipInputSchema.parse({ title: 'Captain' })).toEqual({
      title: 'Captain',
    })
    expect(updateCharacterOrganizationMembershipInputSchema.parse({ title: null })).toEqual({
      title: null,
    })
    expect(updateCharacterOrganizationMembershipInputSchema.safeParse({}).success).toBe(false)
    expect(
      updateCharacterOrganizationMembershipInputSchema.safeParse({ title: '   ' }).success,
    ).toBe(false)
  })
})
