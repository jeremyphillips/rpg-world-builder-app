import { afterEach, describe, expect, it, vi } from 'vitest'

import { assertArrayItemConfig } from './assert-array-item-config.lib'

describe('assertArrayItemConfig', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('warns when collapsible is combined with explicit compact variant', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    assertArrayItemConfig(
      {
        kind: 'array',
        name: 'examples',
        legend: 'Examples',
        item: { collapsible: true, variant: 'compact' },
        fields: [{ type: 'text', name: 'value', label: 'Value' }],
      },
      'Examples',
    )
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('collapsible'))
  })

  it('does not warn in production', () => {
    const env = process.env.NODE_ENV
    process.env.NODE_ENV = 'production'
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    assertArrayItemConfig(
      {
        kind: 'array',
        name: 'examples',
        legend: 'Examples',
        item: { collapsible: true, variant: 'compact' },
        fields: [{ type: 'text', name: 'value', label: 'Value' }],
      },
      'Examples',
    )
    expect(warn).not.toHaveBeenCalled()
    process.env.NODE_ENV = env
  })
})
