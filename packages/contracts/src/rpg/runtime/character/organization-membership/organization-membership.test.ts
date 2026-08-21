import { describe, expect, it } from 'vitest'

import {
  resolveOrganizationMembershipMetadata,
  resolveOrganizationMembershipPriority,
} from './organization-membership'

const bankCatalog = [
  {
    id: 'omt_1',
    sourceTitleId: 'treasurer' as const,
    label: 'Treasurer',
    priority: 50 as const,
  },
  {
    id: 'omt_2',
    sourceTitleId: 'clerk' as const,
    label: 'Clerk',
    priority: 20 as const,
  },
]

describe('resolveOrganizationMembershipPriority', () => {
  it('keeps persisted priority authoritative even when title matches catalog', () => {
    expect(
      resolveOrganizationMembershipPriority({
        membership: { title: 'Treasurer', priority: 15 },
        titles: bankCatalog,
      }),
    ).toBe(15)
  })

  it('falls back to catalog priority when membership priority is absent', () => {
    expect(
      resolveOrganizationMembershipPriority({
        membership: { title: 'Clerk' },
        titles: bankCatalog,
      }),
    ).toBe(20)
  })
})

describe('resolveOrganizationMembershipMetadata', () => {
  it('stamps catalog label and priority for known titles', () => {
    expect(
      resolveOrganizationMembershipMetadata({
        titles: bankCatalog,
        selectedTitle: 'Treasurer',
      }),
    ).toEqual({ title: 'Treasurer', priority: 50 })
  })

  it('clears title and priority for No title', () => {
    expect(
      resolveOrganizationMembershipMetadata({
        titles: bankCatalog,
        selectedTitle: undefined,
      }),
    ).toEqual({ title: undefined, priority: undefined })
  })

  it('preserves custom title priority on edit', () => {
    expect(
      resolveOrganizationMembershipMetadata({
        titles: bankCatalog,
        selectedTitle: 'Sea Lord',
        currentMembership: { title: 'Sea Lord', priority: 45 },
      }),
    ).toEqual({ title: 'Sea Lord', priority: 45 })
  })
})
