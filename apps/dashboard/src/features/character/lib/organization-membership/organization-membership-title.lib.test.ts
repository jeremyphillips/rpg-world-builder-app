import { describe, expect, it } from 'vitest'

import {
  buildOrganizationMembershipTitleRadioOptions,
  membershipRadioValueFromMembershipTitleId,
  membershipTitleIdFromRadioValue,
} from './organization-membership-title.lib'

const catalog = [
  { id: 'omt_1', label: 'Guildmaster', priority: 50 as const },
  { id: 'omt_2', label: 'Member', priority: 20 as const },
]

describe('organization membership title radio helpers', () => {
  it('builds catalog-only radio options', () => {
    expect(buildOrganizationMembershipTitleRadioOptions({ titles: catalog })).toEqual([
      { value: 'omt_1', label: 'Guildmaster' },
      { value: 'omt_2', label: 'Member' },
    ])
  })

  it('maps radio values to membership title ids', () => {
    expect(membershipTitleIdFromRadioValue('omt_1')).toBe('omt_1')
    expect(() => membershipTitleIdFromRadioValue('')).toThrow(/required/)
  })

  it('maps sole-catalog selection when membership title id is missing', () => {
    expect(
      membershipRadioValueFromMembershipTitleId(undefined, [
        { id: 'omt_only', label: 'Member', priority: 10 },
      ]),
    ).toBe('omt_only')
  })

  it('leaves multi-catalog selection unset when membership title id is missing', () => {
    expect(membershipRadioValueFromMembershipTitleId(undefined, catalog)).toBeUndefined()
  })

  it('leaves selection unset when the stored id is missing from the catalog', () => {
    expect(membershipRadioValueFromMembershipTitleId('omt_missing', catalog)).toBeUndefined()
  })
})
