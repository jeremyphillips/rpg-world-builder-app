import { describe, expect, it, vi } from 'vitest'

import type { ArrayConfig } from '../../field-config'
import { assertArrayLabelConfig } from './assert-array-label-config.lib'
import {
  hasNamedArrayLabel,
  resolveArrayLabel,
  resolveArrayLabelMode,
} from './resolve-array-label.lib'

describe('resolveArrayLabel', () => {
  it('returns undefined for anonymous arrays', () => {
    const config = { kind: 'array' as const, name: 'items', fields: [] }
    expect(resolveArrayLabel(config)).toBeUndefined()
    expect(resolveArrayLabelMode(config)).toBe('anonymous')
    expect(hasNamedArrayLabel(config)).toBe(false)
  })

  it('resolves visible named arrays', () => {
    const config: ArrayConfig = {
      kind: 'array',
      name: 'traits',
      label: 'Traits',
      hint: 'Add traits.',
      fields: [],
    }
    expect(resolveArrayLabel(config)).toEqual({
      label: 'Traits',
      hint: 'Add traits.',
      labelVisibility: 'visible',
    })
    expect(resolveArrayLabelMode(config)).toBe('visible')
    expect(hasNamedArrayLabel(config)).toBe(true)
  })

  it('resolves sr-only labels', () => {
    const config: ArrayConfig = {
      kind: 'array',
      name: 'effects',
      label: 'Effects',
      labelVisibility: 'srOnly',
      fields: [],
    }
    expect(resolveArrayLabelMode(config)).toBe('srOnly')
    expect(hasNamedArrayLabel(config)).toBe(true)
  })
})

describe('assertArrayLabelConfig', () => {
  it('warns on invalid label and hint combinations in development', () => {
    const env = process.env.NODE_ENV
    process.env.NODE_ENV = 'development'
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    assertArrayLabelConfig({ kind: 'array', name: 'items', label: '  ', fields: [] })
    assertArrayLabelConfig({
      kind: 'array',
      name: 'items',
      hint: 'Nope',
      fields: [],
    } as unknown as ArrayConfig)

    expect(warn).toHaveBeenCalled()
    warn.mockRestore()
    process.env.NODE_ENV = env
  })
})
