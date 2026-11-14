import { describe, expect, it } from 'vitest'

import type { ArrayConfig } from '../../field-config'
import {
  hasNamedArrayHeading,
  resolveArrayHeading,
  resolveArrayLabelMode,
} from './resolve-array-heading.lib'

describe('resolveArrayHeading', () => {
  it('returns undefined for anonymous arrays', () => {
    const config = { kind: 'array', name: 'traits', fields: [] } satisfies ArrayConfig
    expect(resolveArrayHeading(config)).toBeUndefined()
    expect(resolveArrayLabelMode(config)).toBe('anonymous')
    expect(hasNamedArrayHeading(config)).toBe(false)
  })

  it('resolves visible named arrays', () => {
    const config = {
      kind: 'array',
      name: 'traits',
      heading: { label: '  Traits  ', hint: 'Add traits' },
      fields: [],
    } satisfies ArrayConfig
    expect(resolveArrayHeading(config)).toEqual({
      label: 'Traits',
      hint: 'Add traits',
    })
    expect(resolveArrayLabelMode(config)).toBe('visible')
    expect(hasNamedArrayHeading(config)).toBe(true)
  })

  it('resolves sr-only label visibility', () => {
    const config = {
      kind: 'array',
      name: 'traits',
      heading: { label: 'Traits', labelVisibility: 'srOnly' },
      fields: [],
    } satisfies ArrayConfig
    expect(resolveArrayLabelMode(config)).toBe('srOnly')
    expect(hasNamedArrayHeading(config)).toBe(true)
  })
})
