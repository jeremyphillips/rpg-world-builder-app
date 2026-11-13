import { DEFAULT_RESOLUTION_TARGET } from '@rpg/contracts'
import { describe, expect, it } from 'vitest'

import { withDefaultSaveResolutionTarget } from './monster-save-resolution-target.lib'

describe('withDefaultSaveResolutionTarget', () => {
  it('seeds one creature within 5 feet when targets mode has no target', () => {
    expect(
      withDefaultSaveResolutionTarget({
        kind: 'save',
        resolution: { selectionMode: 'targets' },
      }),
    ).toEqual({
      kind: 'save',
      resolution: { selectionMode: 'targets', target: { ...DEFAULT_RESOLUTION_TARGET } },
    })
  })

  it('leaves an existing target unchanged', () => {
    const target = {
      count: 3,
      kind: 'creature',
      proximity: { kind: 'reach', distance: { value: 10, unit: 'ft' } },
    }
    expect(
      withDefaultSaveResolutionTarget({
        kind: 'save',
        resolution: { selectionMode: 'targets', target },
      }),
    ).toEqual({ kind: 'save', resolution: { selectionMode: 'targets', target } })
  })
})
