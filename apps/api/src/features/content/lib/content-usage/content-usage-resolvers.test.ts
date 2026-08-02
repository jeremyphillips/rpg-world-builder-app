import { describe, expect, it } from 'vitest'

import { API_CONTENT_TYPE_KEYS } from '@rpg/contracts'

import {
  assertContentUsageRegistrationCoverage,
  EXPECTED_CONTENT_USAGE_SURFACES,
  NESTED_CONTENT_USAGE_SURFACE_KEYS,
} from './content-usage-resolvers'

describe('content usage resolver coverage', () => {
  it('derives expected surfaces from API_CONTENT_TYPE_KEYS plus nested keys', () => {
    expect(EXPECTED_CONTENT_USAGE_SURFACES).toEqual([
      ...API_CONTENT_TYPE_KEYS,
      ...NESTED_CONTENT_USAGE_SURFACE_KEYS,
    ])
  })

  it('assertContentUsageRegistrationCoverage passes for the current registry', () => {
    expect(() => assertContentUsageRegistrationCoverage()).not.toThrow()
  })
})
