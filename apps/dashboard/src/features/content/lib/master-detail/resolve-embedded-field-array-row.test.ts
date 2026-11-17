import { describe, expect, it } from 'vitest'

import {
  buildEmbeddedFieldArrayRowSnapshot,
  isEmbeddedFieldArrayRowReady,
  readEmbeddedFieldArrayRow,
} from './resolve-embedded-field-array-row'

describe('resolve embedded field array row', () => {
  it('treats only plain row objects as ready', () => {
    expect(isEmbeddedFieldArrayRowReady({ id: 'a' })).toBe(true)
    expect(isEmbeddedFieldArrayRowReady(undefined)).toBe(false)
    expect(isEmbeddedFieldArrayRowReady(null)).toBe(false)
    expect(isEmbeddedFieldArrayRowReady('x')).toBe(false)
    expect(isEmbeddedFieldArrayRowReady([])).toBe(false)
  })

  it('prefers getValues over a lagging watch', () => {
    const getValues = (name: string) => (name === 'traits.0' ? { id: 'd1', name: '' } : undefined)
    const watched = undefined
    expect(readEmbeddedFieldArrayRow('traits', 0, getValues, watched)).toEqual({
      id: 'd1',
      name: '',
    })
  })

  it('falls back to watch when the value store has no row yet', () => {
    const getValues = () => undefined
    const watched = [{ id: 'd1', name: 'Named' }]
    expect(readEmbeddedFieldArrayRow('traits', 0, getValues, watched)).toEqual({
      id: 'd1',
      name: 'Named',
    })
  })

  it('builds a snapshot aligned to field count with undefined slots when unresolved', () => {
    const getValues = (name: string) => (name === 'traits.0' ? { id: 'a', name: '' } : undefined)
    const snapshot = buildEmbeddedFieldArrayRowSnapshot('traits', 2, getValues, undefined)
    expect(snapshot).toEqual([{ id: 'a', name: '' }, undefined])
  })
})
