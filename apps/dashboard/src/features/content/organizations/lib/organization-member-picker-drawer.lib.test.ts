import { describe, expect, it } from 'vitest'

import type { OrganizationMemberPickerCandidate } from '../components/organization-member-picker-drawer.client'
import {
  ORGANIZATION_MEMBER_PICKER_AVAILABLE_CLASSES,
  ORGANIZATION_MEMBER_PICKER_ORGANIZATION,
} from '../components/organization-member-picker-drawer.fixtures'
import {
  filterAndSortOrganizationMemberPickerCandidates,
  formatOrganizationMemberPickerStatusBadgeLabel,
  isOrganizationMemberPickerRecommended,
  ORGANIZATION_MEMBER_PICKER_ALREADY_MEMBER_LABEL,
} from './organization-member-picker-drawer.lib'

const FIGHTER_CLASS_ID = 'srd-cc-5.2.1:fighter'
const ROGUE_CLASS_ID = 'srd-cc-5.2.1:rogue'

function candidate(
  overrides: Partial<OrganizationMemberPickerCandidate> &
    Pick<OrganizationMemberPickerCandidate, 'id' | 'name'>,
): OrganizationMemberPickerCandidate {
  return {
    summary: '',
    characterType: 'pc',
    classIds: [],
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

describe('isOrganizationMemberPickerRecommended', () => {
  it('matches any surviving class id for multiclass characters', () => {
    expect(
      isOrganizationMemberPickerRecommended(
        candidate({
          id: 'char-1',
          name: 'Split',
          classIds: [FIGHTER_CLASS_ID, ROGUE_CLASS_ID],
        }),
        {
          memberClassAffinityIds: [ROGUE_CLASS_ID],
          availableClasses: ORGANIZATION_MEMBER_PICKER_AVAILABLE_CLASSES,
        },
      ),
    ).toBe(true)
  })

  it('returns false for existing members and unavailable affinities', () => {
    expect(
      isOrganizationMemberPickerRecommended(
        candidate({
          id: 'char-1',
          name: 'Rogue',
          classIds: [ROGUE_CLASS_ID],
          isMember: true,
        }),
        {
          memberClassAffinityIds: ORGANIZATION_MEMBER_PICKER_ORGANIZATION.memberClassAffinityIds,
          availableClasses: ORGANIZATION_MEMBER_PICKER_AVAILABLE_CLASSES,
        },
      ),
    ).toBe(false)

    expect(
      isOrganizationMemberPickerRecommended(
        candidate({
          id: 'char-2',
          name: 'Wizard',
          classIds: ['srd-cc-5.2.1:wizard'],
        }),
        {
          memberClassAffinityIds: ['srd-cc-5.2.1:wizard'],
          availableClasses: ORGANIZATION_MEMBER_PICKER_AVAILABLE_CLASSES.filter(
            (characterClass) => characterClass.id !== 'srd-cc-5.2.1:wizard',
          ),
        },
      ),
    ).toBe(false)
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

  it('ranks recommended non-members before other non-members when browsing', () => {
    const items = [
      candidate({
        id: 'addable-fighter',
        name: 'Brock',
        classIds: [FIGHTER_CLASS_ID],
        characterType: 'pc',
      }),
      candidate({
        id: 'addable-rogue',
        name: 'Street Runner',
        classIds: [ROGUE_CLASS_ID],
        characterType: 'npc',
      }),
    ]

    const sorted = filterAndSortOrganizationMemberPickerCandidates(items, {
      searchQuery: '',
      memberClassAffinityIds: [ROGUE_CLASS_ID],
      availableClasses: ORGANIZATION_MEMBER_PICKER_AVAILABLE_CLASSES,
    })

    expect(sorted.map((item) => item.name)).toEqual(['Street Runner', 'Brock'])
    expect(sorted[0]?.isRecommended).toBe(true)
  })

  it('prefers PCs over NPCs when recommendation and name would otherwise tie', () => {
    const items = [
      candidate({
        id: 'npc-rogue',
        name: 'Runner',
        classIds: [ROGUE_CLASS_ID],
        characterType: 'npc',
      }),
      candidate({
        id: 'pc-rogue',
        name: 'Runner',
        classIds: [ROGUE_CLASS_ID],
        characterType: 'pc',
      }),
    ]

    expect(
      filterAndSortOrganizationMemberPickerCandidates(items, {
        searchQuery: '',
        memberClassAffinityIds: [ROGUE_CLASS_ID],
        availableClasses: ORGANIZATION_MEMBER_PICKER_AVAILABLE_CLASSES,
      }).map((item) => item.characterType),
    ).toEqual(['pc', 'npc'])
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

  it('uses affinity as a tiebreaker after search score', () => {
    const items = [
      candidate({
        id: 'addable-fighter',
        name: 'Brock Fighter',
        summary: 'Human Fighter',
        classIds: [FIGHTER_CLASS_ID],
      }),
      candidate({
        id: 'addable-rogue',
        name: 'Brock Rogue',
        summary: 'Human Rogue',
        classIds: [ROGUE_CLASS_ID],
      }),
    ]

    expect(
      filterAndSortOrganizationMemberPickerCandidates(items, {
        searchQuery: 'Brock',
        memberClassAffinityIds: [ROGUE_CLASS_ID],
        availableClasses: ORGANIZATION_MEMBER_PICKER_AVAILABLE_CLASSES,
      }).map((item) => item.name),
    ).toEqual(['Brock Rogue', 'Brock Fighter'])
  })
})
