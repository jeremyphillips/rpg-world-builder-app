import { describe, expect, it } from 'vitest'

import { ORGANIZATION_KIND_IDS } from './organization-kind'
import {
  ORGANIZATION_MEMBER_TITLE_DEFAULTS,
  resolveOrganizationMemberTitleSuggestions,
} from './organization-member-title'

describe('resolveOrganizationMemberTitleSuggestions', () => {
  it('provides non-empty defaults for every organization kind', () => {
    for (const kind of ORGANIZATION_KIND_IDS) {
      const defaults = ORGANIZATION_MEMBER_TITLE_DEFAULTS[kind]
      expect(defaults.length).toBeGreaterThan(0)
      expect(resolveOrganizationMemberTitleSuggestions({ kind })).toEqual(defaults)
    }
  })

  it('returns subtype titles for a valid kind/subtype pair', () => {
    expect(
      resolveOrganizationMemberTitleSuggestions({ kind: 'criminal', subtype: 'thieves_guild' }),
    ).toEqual(['Guildmaster', 'Master Thief', 'Thief', 'Cutpurse', 'Apprentice'])
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
      resolveOrganizationMemberTitleSuggestions({ kind: 'military', subtype: 'thieves_guild' }),
    ).not.toContain('Master Thief')
  })

  it('preserves deterministic suggestion ordering', () => {
    const first = resolveOrganizationMemberTitleSuggestions({
      kind: 'government',
      subtype: 'council',
    })
    const second = resolveOrganizationMemberTitleSuggestions({
      kind: 'government',
      subtype: 'council',
    })
    expect(first).toEqual(second)
    expect(first).toEqual(['Chair', 'Councillor', 'Speaker', 'Delegate', 'Clerk'])
  })
})
