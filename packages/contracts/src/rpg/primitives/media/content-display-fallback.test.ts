import { describe, expect, it } from 'vitest'

import { CONTENT_TYPE_KEYS } from '../content/content-type-keys'
import {
  resolveContentDisplayFallback,
  resolveContentDisplayFallbackForContentType,
} from './content-display-fallback'
import { resolveContentDisplayFallbackForSearchTarget } from '../../campaign/global-search/content-display-fallback-search.lib'
import { resolveContentMediaDomainForContentType } from '../media/resolve-content-media-domain'

describe('resolveContentDisplayFallback', () => {
  it('uses class and species keys on compact and search surfaces', () => {
    expect(resolveContentDisplayFallback({ domain: 'class', surface: 'compact' })).toBe('class')
    expect(resolveContentDisplayFallback({ domain: 'species', surface: 'search' })).toBe('species')
  })

  it('keeps class and species on generic for detail and field surfaces', () => {
    expect(resolveContentDisplayFallback({ domain: 'class', surface: 'detail' })).toBe('generic')
    expect(resolveContentDisplayFallback({ domain: 'species', surface: 'field' })).toBe('generic')
  })

  it('selects npc vs character on compact identity surfaces', () => {
    expect(
      resolveContentDisplayFallback({
        domain: 'character',
        surface: 'compact',
        characterType: 'npc',
      }),
    ).toBe('npc')
    expect(
      resolveContentDisplayFallback({
        domain: 'character',
        surface: 'compact',
        characterType: 'pc',
      }),
    ).toBe('character')
  })

  it('maps non-media catalog kinds directly', () => {
    expect(resolveContentDisplayFallback({ domain: 'spell', surface: 'search' })).toBe('spell')
    expect(resolveContentDisplayFallback({ domain: 'game-term', surface: 'compact' })).toBe(
      'game-term',
    )
  })
})

describe('resolveContentDisplayFallbackForContentType', () => {
  it('covers every content type key via media domain or non-media subject map', () => {
    for (const contentType of CONTENT_TYPE_KEYS) {
      expect(resolveContentDisplayFallbackForContentType(contentType)).toBeDefined()
    }
  })

  it('delegates media-opted types to resolveContentMediaDomainForContentType', () => {
    for (const contentType of CONTENT_TYPE_KEYS) {
      const mediaDomain = resolveContentMediaDomainForContentType(contentType)
      if (!mediaDomain) continue
      expect(resolveContentDisplayFallbackForContentType(contentType, 'compact')).toBe(
        resolveContentDisplayFallback({ domain: mediaDomain, surface: 'compact' }),
      )
    }
  })

  it('uses field surface policy for media catalog types', () => {
    expect(resolveContentDisplayFallbackForContentType('classes')).toBe('generic')
    expect(resolveContentDisplayFallbackForContentType('species')).toBe('generic')
    expect(resolveContentDisplayFallbackForContentType('equipment')).toBe('equipment')
  })

  it('maps non-media catalog types to their identity keys on field surfaces', () => {
    expect(resolveContentDisplayFallbackForContentType('spells')).toBe('spell')
    expect(resolveContentDisplayFallbackForContentType('feats')).toBe('feat')
    expect(resolveContentDisplayFallbackForContentType('skill-proficiencies')).toBe(
      'skill-proficiency',
    )
  })
})

describe('resolveContentDisplayFallbackForSearchTarget', () => {
  it('delegates character targets with npc type', () => {
    expect(
      resolveContentDisplayFallbackForSearchTarget({
        kind: 'character',
        id: '1',
        characterType: 'npc',
      }),
    ).toBe('npc')
  })

  it('delegates spell targets', () => {
    expect(
      resolveContentDisplayFallbackForSearchTarget({
        kind: 'spell',
        id: 'fireball',
      }),
    ).toBe('spell')
  })
})
