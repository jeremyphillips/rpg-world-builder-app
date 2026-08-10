import { describe, expect, it } from 'vitest'

import { ORGANIZATION_KIND_IDS } from './organization-kind'
import {
  ORGANIZATION_MEMBER_TITLE_DEFAULTS,
  ORGANIZATION_MEMBER_TITLE_PRIORITIES,
  resolveOrganizationMemberTitleEntry,
  resolveOrganizationMemberTitleSuggestions,
} from './organization-member-title'

describe('resolveOrganizationMemberTitleSuggestions', () => {
  it('provides non-empty prioritized defaults for every organization kind', () => {
    for (const kind of ORGANIZATION_KIND_IDS) {
      const defaults = ORGANIZATION_MEMBER_TITLE_DEFAULTS[kind]
      expect(defaults.length).toBeGreaterThan(0)
      expect(resolveOrganizationMemberTitleSuggestions({ kind })).toEqual(defaults)
      for (const [index, entry] of defaults.entries()) {
        expect(entry.priority).toBe(ORGANIZATION_MEMBER_TITLE_PRIORITIES[index])
        expect(entry.label.length).toBeGreaterThan(0)
      }
    }
  })

  it('returns subtype title entries for a valid kind/subtype pair', () => {
    expect(
      resolveOrganizationMemberTitleSuggestions({ kind: 'criminal', subtype: 'thieves_guild' }),
    ).toEqual([
      { label: 'Guildmaster', priority: 50 },
      { label: 'Master Thief', priority: 40 },
      { label: 'Thief', priority: 30 },
      { label: 'Cutpurse', priority: 20 },
      { label: 'Apprentice', priority: 10 },
    ])
  })

  it('falls back to kind defaults when subtype is absent', () => {
    expect(resolveOrganizationMemberTitleSuggestions({ kind: 'professional' })).toEqual(
      ORGANIZATION_MEMBER_TITLE_DEFAULTS.professional,
    )
  })

  it('falls back to kind defaults for an incompatible subtype (never wrong-kind titles)', () => {
    expect(
      resolveOrganizationMemberTitleSuggestions({ kind: 'military', subtype: 'thieves_guild' }),
    ).toEqual(ORGANIZATION_MEMBER_TITLE_DEFAULTS.military)
    expect(
      resolveOrganizationMemberTitleSuggestions({
        kind: 'military',
        subtype: 'thieves_guild',
      }).map((entry) => entry.label),
    ).not.toContain('Master Thief')
  })

  it('preserves deterministic suggestion ordering and priorities', () => {
    const first = resolveOrganizationMemberTitleSuggestions({
      kind: 'government',
      subtype: 'council',
    })
    const second = resolveOrganizationMemberTitleSuggestions({
      kind: 'government',
      subtype: 'council',
    })
    expect(first).toEqual(second)
    expect(first).toEqual([
      { label: 'Chair', priority: 50 },
      { label: 'Councillor', priority: 40 },
      { label: 'Speaker', priority: 30 },
      { label: 'Delegate', priority: 20 },
      { label: 'Clerk', priority: 10 },
    ])
  })
})

describe('resolveOrganizationMemberTitleEntry', () => {
  it('resolves from the identical entry source as suggestions', () => {
    const suggestions = resolveOrganizationMemberTitleSuggestions({
      kind: 'criminal',
      subtype: 'thieves_guild',
    })
    for (const entry of suggestions) {
      expect(
        resolveOrganizationMemberTitleEntry({
          kind: 'criminal',
          subtype: 'thieves_guild',
          title: entry.label,
        }),
      ).toEqual(entry)
    }
  })

  it('returns undefined for unknown or blank titles', () => {
    expect(
      resolveOrganizationMemberTitleEntry({
        kind: 'professional',
        title: 'Custom Chronicler',
      }),
    ).toBeUndefined()
    expect(
      resolveOrganizationMemberTitleEntry({
        kind: 'professional',
        title: '   ',
      }),
    ).toBeUndefined()
  })

  it('type-checks that every title entry carries priority', () => {
    const entry = resolveOrganizationMemberTitleEntry({
      kind: 'professional',
      title: 'Guildmaster',
    })
    expect(entry).toEqual({ label: 'Guildmaster', priority: 50 })
    // Compile-time: OrganizationMemberTitleEntry requires priority — omitting it is a type error.
    const _required: { label: string; priority: number } = entry!
    expect(_required.priority).toBe(50)
  })
})
