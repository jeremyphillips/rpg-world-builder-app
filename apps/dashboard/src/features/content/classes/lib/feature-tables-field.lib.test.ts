import { describe, expect, it } from 'vitest'

import { makeContentFormCtx } from '../../lib/fixtures/content-form-ctx'
import {
  buildFeatureTableAllowedLevels,
  formatFeatureTableMetadata,
} from './feature-tables-field.lib'

const rageTable = {
  id: 'rage-progression',
  name: 'Rage progression',
  kind: 'levelProgression' as const,
  columns: [
    {
      id: 'uses',
      label: 'Rages',
      valueType: 'number' as const,
      entries: [
        { level: 1, value: 2 },
        { level: 3, value: 3 },
        { level: 6, value: 4 },
        { level: 12, value: 5 },
        { level: 17, value: 6 },
      ],
    },
    {
      id: 'damage-bonus',
      label: 'Rage Damage',
      valueType: 'number' as const,
      format: 'signed' as const,
      entries: [
        { level: 1, value: 2 },
        { level: 9, value: 3 },
        { level: 16, value: 4 },
      ],
    },
  ],
}

describe('formatFeatureTableMetadata', () => {
  it('reports column and breakpoint counts', () => {
    expect(formatFeatureTableMetadata(rageTable)).toBe('2 columns · 7 breakpoints')
  })

  it('singularizes single column and breakpoint labels', () => {
    expect(
      formatFeatureTableMetadata({
        ...rageTable,
        columns: [rageTable.columns[0]!],
      }),
    ).toBe('1 column · 5 breakpoints')
  })
})

describe('buildFeatureTableAllowedLevels', () => {
  it('starts at the feature level through the campaign max', () => {
    expect(buildFeatureTableAllowedLevels(3, makeContentFormCtx())).toEqual(
      Array.from({ length: 18 }, (_, index) => index + 3),
    )
  })

  it('extends through campaign ruleset patches above 20', () => {
    expect(
      buildFeatureTableAllowedLevels(
        1,
        makeContentFormCtx({ campaignRules: { maxCharacterLevel: 30 } }),
      ),
    ).toHaveLength(30)
  })

  it('returns an empty set for invalid feature levels', () => {
    expect(buildFeatureTableAllowedLevels('', makeContentFormCtx())).toEqual([])
  })
})
