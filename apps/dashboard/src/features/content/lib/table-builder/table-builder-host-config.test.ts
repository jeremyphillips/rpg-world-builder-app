import { describe, expect, it } from 'vitest'

import {
  assertTableBuilderHostConfig,
  resolveTableBuilderRecommendedKind,
  type TableBuilderHostConfig,
} from './table-builder-host-config'

describe('assertTableBuilderHostConfig', () => {
  it('rejects an empty allowedKinds tuple at runtime', () => {
    expect(() =>
      assertTableBuilderHostConfig({ allowedKinds: [] as unknown as ['general'] }),
    ).toThrow(/non-empty/i)
  })

  it('rejects a recommendedKind outside allowedKinds', () => {
    const config: TableBuilderHostConfig = {
      allowedKinds: ['general'],
      recommendedKind: 'levelProgression',
    }
    expect(() => assertTableBuilderHostConfig(config)).toThrow(/recommendedKind/i)
  })
})

describe('resolveTableBuilderRecommendedKind', () => {
  it('falls back to the first allowed kind', () => {
    expect(
      resolveTableBuilderRecommendedKind({
        allowedKinds: ['general', 'levelProgression'],
      }),
    ).toBe('general')
  })
})
