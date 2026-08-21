import { describe, expect, it } from 'vitest'

import {
  getOrganizationMembershipTitleEntry,
  getOrganizationMembershipTitleDiscoveryTerms,
  ORGANIZATION_MEMBERSHIP_TITLE_ENTRIES,
  ORGANIZATION_MEMBERSHIP_TITLE_TERM,
} from './membership-title'

describe('organization membership title vocabulary', () => {
  it('registers taxonomy term metadata', () => {
    expect(ORGANIZATION_MEMBERSHIP_TITLE_TERM.label).toBe('Organization Membership Title')
  })

  it('requires label and description on every canonical entry', () => {
    for (const [id, entry] of Object.entries(ORGANIZATION_MEMBERSHIP_TITLE_ENTRIES)) {
      expect(id).toMatch(/^[a-z0-9]+(?:_[a-z0-9]+)*$/)
      expect(entry.label.trim()).not.toBe('')
      expect(entry.description.trim()).not.toBe('')
    }
  })

  it('resolves entries by title id', () => {
    expect(getOrganizationMembershipTitleEntry('quartermaster')).toMatchObject({
      label: 'Quartermaster',
    })
    expect(getOrganizationMembershipTitleEntry('missing_title')).toBeUndefined()
  })

  it('exposes discovery terms from label when searchTerms are absent', () => {
    expect(getOrganizationMembershipTitleDiscoveryTerms('quartermaster')).toEqual(['Quartermaster'])
  })
})
