import { describe, expect, it } from 'vitest'

import {
  createCharacterOrganizationMembershipInputSchema,
  resolveOrganizationMembershipMetadata,
  resolveOrganizationMembershipPriority,
  sortOrganizationMembers,
  updateCharacterOrganizationMembershipInputSchema,
} from './organization-membership'

describe('createCharacterOrganizationMembershipInputSchema', () => {
  it('accepts membership with optional title and priority', () => {
    expect(
      createCharacterOrganizationMembershipInputSchema.parse({
        organizationId: 'organization-1',
      }),
    ).toEqual({ organizationId: 'organization-1' })

    expect(
      createCharacterOrganizationMembershipInputSchema.parse({
        organizationId: 'organization-1',
        title: '  Guildmaster  ',
        priority: 50,
      }),
    ).toEqual({ organizationId: 'organization-1', title: 'Guildmaster', priority: 50 })
  })
})

describe('updateCharacterOrganizationMembershipInputSchema', () => {
  it('requires title and priority and accepts string/number or null', () => {
    expect(
      updateCharacterOrganizationMembershipInputSchema.parse({
        title: 'Captain',
        priority: 40,
      }),
    ).toEqual({ title: 'Captain', priority: 40 })
    expect(
      updateCharacterOrganizationMembershipInputSchema.parse({ title: null, priority: null }),
    ).toEqual({ title: null, priority: null })
    expect(updateCharacterOrganizationMembershipInputSchema.safeParse({}).success).toBe(false)
    expect(
      updateCharacterOrganizationMembershipInputSchema.safeParse({ title: 'Captain' }).success,
    ).toBe(false)
    expect(
      updateCharacterOrganizationMembershipInputSchema.safeParse({ priority: 40 }).success,
    ).toBe(false)
    expect(
      updateCharacterOrganizationMembershipInputSchema.safeParse({
        title: '   ',
        priority: 40,
      }).success,
    ).toBe(false)
  })
})

describe('resolveOrganizationMembershipPriority', () => {
  it('keeps persisted priority authoritative even when title matches vocabulary', () => {
    expect(
      resolveOrganizationMembershipPriority({
        membership: { title: 'Guildmaster', priority: 15 },
        kind: 'professional',
        subtype: 'craft_guild',
      }),
    ).toBe(15)
  })

  it('falls back to canonical title priority when membership priority is absent', () => {
    expect(
      resolveOrganizationMembershipPriority({
        membership: { title: 'Guildmaster' },
        kind: 'professional',
        subtype: 'craft_guild',
      }),
    ).toBe(50)
  })

  it('returns undefined for untitled or unknown-title memberships without priority', () => {
    expect(
      resolveOrganizationMembershipPriority({
        membership: {},
        kind: 'professional',
      }),
    ).toBeUndefined()
    expect(
      resolveOrganizationMembershipPriority({
        membership: { title: 'Custom Chronicler' },
        kind: 'professional',
      }),
    ).toBeUndefined()
  })
})

describe('sortOrganizationMembers', () => {
  it('orders by priority descending then unranked, with locale-insensitive name tie-break', () => {
    const sorted = sortOrganizationMembers([
      { id: 'c', name: 'Zed', priority: 20 },
      { id: 'a', name: 'braggi', priority: 50 },
      { id: 'b', name: 'Braggi', priority: 50 },
      { id: 'd', name: 'Ann', priority: 40 },
      { id: 'e', name: 'Unranked' },
      { id: 'f', name: 'Also unranked' },
    ])

    expect(sorted.map((row) => row.id)).toEqual(['a', 'b', 'd', 'c', 'f', 'e'])
  })

  it('uses character id as the final stable key when names match case-insensitively', () => {
    const sorted = sortOrganizationMembers([
      { id: 'z', name: 'Braggi', priority: 50 },
      { id: 'a', name: 'braggi', priority: 50 },
    ])
    expect(sorted.map((row) => row.id)).toEqual(['a', 'z'])
  })
})

describe('resolveOrganizationMembershipMetadata', () => {
  it('stamps canonical title with that entry priority', () => {
    expect(
      resolveOrganizationMembershipMetadata({
        kind: 'professional',
        subtype: 'craft_guild',
        selectedTitle: 'Guildmaster',
      }),
    ).toEqual({ title: 'Guildmaster', priority: 50 })
  })

  it('clears title and priority for No title', () => {
    expect(
      resolveOrganizationMembershipMetadata({
        kind: 'professional',
        selectedTitle: undefined,
        currentMembership: { title: 'Guildmaster', priority: 50 },
      }),
    ).toEqual({ title: undefined, priority: undefined })
  })

  it('preserves explicit priority for custom/historical titles', () => {
    expect(
      resolveOrganizationMembershipMetadata({
        kind: 'professional',
        selectedTitle: 'Custom Chronicler',
        currentMembership: { title: 'Custom Chronicler', priority: 15 },
      }),
    ).toEqual({ title: 'Custom Chronicler', priority: 15 })
  })
})
