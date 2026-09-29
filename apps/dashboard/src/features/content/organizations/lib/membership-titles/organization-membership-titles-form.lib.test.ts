import { describe, expect, it } from 'vitest'
import {
  createDefaultOrganizationMembershipTitleDefinition,
  organizationMembershipTitleIdSchema,
} from '@rpg/contracts'

import {
  createOrganizationMembershipTitleAppendRow,
  normalizeOrganizationMembershipTitleFormRows,
  ORGANIZATION_MEMBERSHIP_TITLE_FIELD_ARRAY_KEY,
} from './organization-membership-titles-form.lib'

describe('organization membership titles form lib', () => {
  it('uses a distinct field-array key from domain id', () => {
    expect(ORGANIZATION_MEMBERSHIP_TITLE_FIELD_ARRAY_KEY).not.toBe('id')
  })

  it('createOrganizationMembershipTitleAppendRow yields empty label and lowest priority', () => {
    const row = createOrganizationMembershipTitleAppendRow()
    expect(row.label).toBe('')
    expect(row.priority).toBe(10)
  })

  it('createOrganizationMembershipTitleAppendRow id passes organizationMembershipTitleIdSchema once', () => {
    const row = createOrganizationMembershipTitleAppendRow()
    expect(organizationMembershipTitleIdSchema.safeParse(row.id).success).toBe(true)
    expect(row.id.startsWith('omt_omt_')).toBe(false)
  })

  it('normalizeOrganizationMembershipTitleFormRows coerces valid rank strings only', () => {
    expect(
      normalizeOrganizationMembershipTitleFormRows([
        { id: 'omt_a', label: 'Captain', priority: '40' },
      ]),
    ).toEqual([{ id: 'omt_a', label: 'Captain', priority: 40 }])
  })

  it('normalizeOrganizationMembershipTitleFormRows leaves invalid rank strings unchanged', () => {
    expect(
      normalizeOrganizationMembershipTitleFormRows([
        { id: 'omt_a', label: 'Captain', priority: '99' },
      ]),
    ).toEqual([{ id: 'omt_a', label: 'Captain', priority: '99' }])
  })

  it('append row id generation differs from create-default Member row semantics', () => {
    const appendRow = createOrganizationMembershipTitleAppendRow()
    const memberDefault = createDefaultOrganizationMembershipTitleDefinition()
    expect(appendRow.label).not.toBe(memberDefault.label)
    expect(organizationMembershipTitleIdSchema.safeParse(memberDefault.id).success).toBe(true)
  })
})
