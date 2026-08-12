import { describe, expect, it } from 'vitest'

import type { OrganizationMemberPickerCandidate } from '../components/organization-member-picker-drawer.client'
import {
  filterAndSortOrganizationMemberPickerCandidates,
  formatOrganizationMemberPickerStatusBadgeLabel,
  ORGANIZATION_MEMBER_PICKER_ALREADY_MEMBER_LABEL,
} from './organization-member-picker-drawer.lib'

function candidate(
  overrides: Partial<OrganizationMemberPickerCandidate> &
    Pick<OrganizationMemberPickerCandidate, 'id' | 'name'>,
): OrganizationMemberPickerCandidate {
  return {
    summary: '',
    characterType: 'pc',
    isMember: false,
    ...overrides,
  }
}

describe('formatOrganizationMemberPickerStatusBadgeLabel', () => {
  it('returns Member when no title is set', () => {
    expect(formatOrganizationMemberPickerStatusBadgeLabel()).toBe(
      ORGANIZATION_MEMBER_PICKER_ALREADY_MEMBER_LABEL,
    )
    expect(formatOrganizationMemberPickerStatusBadgeLabel('')).toBe(
      ORGANIZATION_MEMBER_PICKER_ALREADY_MEMBER_LABEL,
    )
  })

  it('appends the membership title when present', () => {
    expect(formatOrganizationMemberPickerStatusBadgeLabel('Journeyman')).toBe('Member · Journeyman')
    expect(formatOrganizationMemberPickerStatusBadgeLabel('Guildmaster')).toBe(
      'Member · Guildmaster',
    )
  })
})

describe('filterAndSortOrganizationMemberPickerCandidates', () => {
  it('lists non-members before existing members, then by name within each group', () => {
    const items = [
      candidate({ id: 'member-z', name: 'Zara', isMember: true }),
      candidate({ id: 'addable-b', name: 'Brock', isMember: false }),
      candidate({ id: 'member-a', name: 'Alden', isMember: true, membershipTitle: 'Treasurer' }),
      candidate({ id: 'addable-a', name: 'Verna', isMember: false }),
    ]

    expect(
      filterAndSortOrganizationMemberPickerCandidates(items, { searchQuery: '' }).map(
        (item) => item.name,
      ),
    ).toEqual(['Brock', 'Verna', 'Alden', 'Zara'])
  })

  it('ranks stronger search matches first, then deprioritizes members', () => {
    const items = [
      candidate({
        id: 'member-envoy',
        name: 'Circle Envoy',
        summary: 'Human · Level 3 Rogue',
        characterType: 'npc',
        isMember: true,
      }),
      candidate({
        id: 'addable-verna',
        name: 'Verna',
        summary: 'Dwarf · Level 1 Fighter',
        isMember: false,
      }),
    ]

    expect(
      filterAndSortOrganizationMemberPickerCandidates(items, { searchQuery: 'Envoy' }).map(
        (item) => item.name,
      ),
    ).toEqual(['Circle Envoy'])
  })

  it('prefers non-members over members when search scores tie', () => {
    const items = [
      candidate({ id: 'member-1', name: 'Braggi', isMember: true }),
      candidate({ id: 'addable-1', name: 'Braggi Jr.', isMember: false }),
    ]

    expect(
      filterAndSortOrganizationMemberPickerCandidates(items, { searchQuery: 'Braggi' }).map(
        (item) => item.name,
      ),
    ).toEqual(['Braggi Jr.', 'Braggi'])
  })
})
