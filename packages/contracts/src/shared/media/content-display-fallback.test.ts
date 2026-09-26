import { describe, expect, it } from 'vitest'

import {
  resolveContentDisplayFallback,
  resolveContentDisplayFallbackForSearchTarget,
} from './content-display-fallback'

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
