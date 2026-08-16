import { describe, expect, it } from 'vitest'

import {
  buildOrganizationMembershipTitleRadioOptions,
  membershipRadioValueFromTitle,
  titleFromMembershipRadioValue,
} from './organization-membership-title-field.lib'
import { ORGANIZATION_MEMBERSHIP_NO_TITLE_VALUE } from './organization-membership-title-field.types'

describe('buildOrganizationMembershipTitleRadioOptions', () => {
  it('includes No title and kind suggestions', () => {
    const options = buildOrganizationMembershipTitleRadioOptions({ kind: 'occupational' })
    expect(options[0]).toEqual({
      value: ORGANIZATION_MEMBERSHIP_NO_TITLE_VALUE,
      label: 'No title',
    })
    expect(options.some((option) => option.value === 'Guildmaster')).toBe(true)
  })

  it('appends an unrecognized current value as a current-value option', () => {
    const options = buildOrganizationMembershipTitleRadioOptions({
      kind: 'occupational',
      currentValue: 'Custom Chronicler',
    })
    expect(options.at(-1)).toEqual({ value: 'Custom Chronicler', label: 'Custom Chronicler' })
  })

  it('does not duplicate a suggestion that matches the current value', () => {
    const options = buildOrganizationMembershipTitleRadioOptions({
      kind: 'occupational',
      currentValue: 'Guildmaster',
    })
    expect(options.filter((option) => option.value === 'Guildmaster')).toHaveLength(1)
  })

  it('threads practices before form when building suggestion order', () => {
    const options = buildOrganizationMembershipTitleRadioOptions({
      kind: 'criminal',
      form: 'guild',
      practices: ['smuggling'],
    })
    const ringleaderIndex = options.findIndex((option) => option.value === 'Ringleader')
    const guildmasterIndex = options.findIndex((option) => option.value === 'Guildmaster')
    expect(ringleaderIndex).toBeGreaterThan(0)
    expect(guildmasterIndex).toBeGreaterThan(0)
    expect(ringleaderIndex).toBeLessThan(guildmasterIndex)
  })
})

describe('title radio value mapping', () => {
  it('maps No title sentinel to undefined and back', () => {
    expect(titleFromMembershipRadioValue(ORGANIZATION_MEMBERSHIP_NO_TITLE_VALUE)).toBeUndefined()
    expect(membershipRadioValueFromTitle(undefined)).toBe(ORGANIZATION_MEMBERSHIP_NO_TITLE_VALUE)
    expect(membershipRadioValueFromTitle(null)).toBe(ORGANIZATION_MEMBERSHIP_NO_TITLE_VALUE)
    expect(membershipRadioValueFromTitle('Captain')).toBe('Captain')
    expect(titleFromMembershipRadioValue('Captain')).toBe('Captain')
  })
})
