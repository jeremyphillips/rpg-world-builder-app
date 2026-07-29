import { describe, expect, expectTypeOf, it } from 'vitest'
import { createOrganizationInputSchema, type CreateOrganizationInput } from '@rpg/contracts'

import { CITY_COUNCIL } from '../fixtures'
import { organizationFormDef } from './organization-form-def'
import type { OrganizationFormValues } from './organization-form-fields'

it('type: toInput return type matches CreateOrganizationInput', () => {
  expectTypeOf(organizationFormDef.toInput).returns.toEqualTypeOf<CreateOrganizationInput>()
})

describe('organizationFormDef', () => {
  it('round-trips organization fields into a publish input', () => {
    const values = organizationFormDef.toFormValues(CITY_COUNCIL) as OrganizationFormValues
    const input = organizationFormDef.toInput(values)
    expect(() => createOrganizationInputSchema.parse(input)).not.toThrow()
    expect(input.organizationKind).toBe('government')
    expect(input.description).toBe(CITY_COUNCIL.description)
  })

  it('allows organization kind to be absent for a draft', () => {
    const input = organizationFormDef.toInput(
      { name: '', description: '' } as OrganizationFormValues,
      undefined,
      'draft',
    )
    expect(input.name).toBe('Untitled Organization')
    expect(input).not.toHaveProperty('organizationKind')
  })

  it('requires organization kind for publish', () => {
    expect(() =>
      organizationFormDef.toInput({ name: 'Incomplete' } as OrganizationFormValues),
    ).toThrow()
  })
})
