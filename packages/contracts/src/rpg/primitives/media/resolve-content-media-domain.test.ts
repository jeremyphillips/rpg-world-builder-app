import { describe, expect, it } from 'vitest'

import { API_CONTENT_TYPE_KEYS, CONTENT_TYPE_KEYS } from '../content/content-type-keys'

import {
  CONTENT_TYPE_MEDIA_DOMAIN,
  CONTENT_TYPE_MEDIA_ENABLED_KEYS,
  resolveContentMediaDomainForContentType,
  resolveContentMediaDomainForDashboardRoute,
} from './resolve-content-media-domain'

describe('CONTENT_TYPE_MEDIA_ENABLED_KEYS', () => {
  it('matches CONTENT_TYPE_MEDIA_DOMAIN keys', () => {
    expect([...CONTENT_TYPE_MEDIA_ENABLED_KEYS].sort()).toEqual(
      Object.keys(CONTENT_TYPE_MEDIA_DOMAIN).sort(),
    )
  })

  it('is a subset of API_CONTENT_TYPE_KEYS', () => {
    for (const key of CONTENT_TYPE_MEDIA_ENABLED_KEYS) {
      expect(API_CONTENT_TYPE_KEYS).toContain(key)
    }
  })

  it('covers every non-media catalog type via exclusion', () => {
    const nonMedia = CONTENT_TYPE_KEYS.filter(
      (key) =>
        !CONTENT_TYPE_MEDIA_ENABLED_KEYS.includes(
          key as (typeof CONTENT_TYPE_MEDIA_ENABLED_KEYS)[number],
        ),
    )
    expect(nonMedia.sort()).toEqual(['feats', 'skill-proficiencies', 'spells'])
  })
})

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
