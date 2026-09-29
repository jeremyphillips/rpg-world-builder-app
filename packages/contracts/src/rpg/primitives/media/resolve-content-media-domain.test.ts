import { describe, expect, it } from 'vitest'

import {
  resolveContentMediaDomainForContentType,
  resolveContentMediaDomainForDashboardRoute,
} from './resolve-content-media-domain'

describe('resolveContentMediaDomainForContentType', () => {
  it('maps opted-in catalog types', () => {
    expect(resolveContentMediaDomainForContentType('classes')).toBe('class')
    expect(resolveContentMediaDomainForContentType('locations')).toBe('location')
  })

  it('returns undefined for non-media catalog types', () => {
    expect(resolveContentMediaDomainForContentType('spells')).toBeUndefined()
    expect(resolveContentMediaDomainForContentType('feats')).toBeUndefined()
  })
})

describe('resolveContentMediaDomainForDashboardRoute', () => {
  it('includes character routes', () => {
    expect(resolveContentMediaDomainForDashboardRoute('characters')).toBe('character')
  })
})
