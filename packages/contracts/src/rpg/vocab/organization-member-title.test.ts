import { describe, expect, it } from 'vitest'

import { ORGANIZATION_DOMAIN_IDS, getOrganizationDomainEntry } from './organization-domain'
import {
  resolveOrganizationMemberTitleEntry,
  resolveOrganizationMemberTitleSuggestions,
} from './organization-member-title'

describe('temporary domain member-title resolution', () => {
  it('resolves the canonical domain contribution', () => {
    for (const domain of ORGANIZATION_DOMAIN_IDS) {
      expect(resolveOrganizationMemberTitleSuggestions({ domain })).toEqual(
        getOrganizationDomainEntry(domain)?.memberTitles,
      )
    }
  })

  it('looks up exact labels from the same contribution', () => {
    expect(
      resolveOrganizationMemberTitleEntry({
        domain: 'occupational',
        title: 'Guildmaster',
      }),
    ).toEqual({ label: 'Guildmaster', priority: 50 })
    expect(
      resolveOrganizationMemberTitleEntry({
        domain: 'occupational',
        title: 'Custom Role',
      }),
    ).toBeUndefined()
  })
})
