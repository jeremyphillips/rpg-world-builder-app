import { describe, expect, it } from 'vitest'

import type { ArrayConfig } from '../field-config'
import {
  buildArrayAddMenuExpandKeys,
  mergeArrayAddMenuDefaults,
  resolveArrayAppendDefaults,
} from './array-field-append.lib'

describe('array-field-append.lib', () => {
  it('resolves appendDefaults when configured', () => {
    const config = {
      kind: 'array',
      name: 'items',
      legend: 'Items',
      fields: [],
      appendDefaults: () => ({ kind: 'custom' }),
    } satisfies ArrayConfig

    expect(resolveArrayAppendDefaults(config, { kind: 'default' }, [])).toEqual({ kind: 'custom' })
    expect(resolveArrayAppendDefaults(config, { kind: 'default' }, [{ kind: 'existing' }])).toEqual(
      {
        kind: 'custom',
      },
    )
  })

  it('falls back to static defaults when appendDefaults is omitted', () => {
    const config = {
      kind: 'array',
      name: 'items',
      legend: 'Items',
      fields: [],
    } satisfies ArrayConfig
    expect(resolveArrayAppendDefaults(config, { kind: 'default' }, [])).toEqual({ kind: 'default' })
  })

  it('merges add-menu defaults over static item defaults', () => {
    expect(
      mergeArrayAddMenuDefaults(
        {
          id: 'movement-bonus',
          label: 'Movement bonus',
          appendDefaults: () => ({ grantType: 'movement', movementMode: 'walk' }),
        },
        { grantType: 'languages', unlockLevel: 1 },
      ),
    ).toEqual({
      grantType: 'movement',
      movementMode: 'walk',
      unlockLevel: 1,
    })
  })

  it('builds validation session expand keys for a new row', () => {
    expect(buildArrayAddMenuExpandKeys('grants', 2, { id: 'row-2' }, 'id')).toEqual([
      'grants:row-2',
    ])
  })
})
