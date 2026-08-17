import { describe, expect, it } from 'vitest'

import {
  buildOrganizationMembershipTitleRadioOptions,
  membershipRadioValueFromTitle,
  titleFromMembershipRadioValue,
} from './organization-membership-title-field.lib'
import { ORGANIZATION_MEMBERSHIP_NO_TITLE_VALUE } from './organization-membership-title-field.types'

const sampleCatalog = [
  { id: 'omt_1', label: 'Guildmaster', priority: 50 as const },
  { id: 'omt_2', label: 'Member', priority: 20 as const },
]

describe('buildOrganizationMembershipTitleRadioOptions', () => {
  it('prepends No title and lists catalog labels by priority', () => {
    const options = buildOrganizationMembershipTitleRadioOptions({
      titles: sampleCatalog,
    })
    expect(options.map((option) => option.label)).toEqual(['No title', 'Guildmaster', 'Member'])
  })

  it('appends a custom current value when absent from the catalog', () => {
    const options = buildOrganizationMembershipTitleRadioOptions({
      titles: sampleCatalog,
      currentValue: 'Sea Lord',
    })
    expect(options.at(-1)).toEqual({ value: 'Sea Lord', label: 'Sea Lord' })
  })

  it('does not duplicate a catalog title passed as currentValue', () => {
    const options = buildOrganizationMembershipTitleRadioOptions({
      titles: sampleCatalog,
      currentValue: 'Guildmaster',
    })
    expect(options.filter((option) => option.label === 'Guildmaster')).toHaveLength(1)
  })
})

describe('membership radio value mappers', () => {
  it('maps No title sentinel to undefined', () => {
    expect(titleFromMembershipRadioValue(ORGANIZATION_MEMBERSHIP_NO_TITLE_VALUE)).toBeUndefined()
    expect(membershipRadioValueFromTitle(undefined)).toBe(ORGANIZATION_MEMBERSHIP_NO_TITLE_VALUE)
  })
})
