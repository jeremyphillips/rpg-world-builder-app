import { describe, expect, it } from 'vitest'

import type { TableGridPresentationRow } from '../../components/tables/table-grid-presentation'
import {
  shouldRenderValuesTierSeparator,
  withTierSeparatorAfterStandardMax,
} from './table-builder-tier-separator.lib'

describe('table-builder tier separator lib', () => {
  it('inserts a preview separator after the last standard level', () => {
    const rows: TableGridPresentationRow[] = [
      { rowHeader: 19, cells: { xp: '305,000' } },
      { rowHeader: 20, cells: { xp: '355,000' } },
      { rowHeader: 21, cells: { xp: '405,000' } },
    ]

    expect(withTierSeparatorAfterStandardMax(rows, 20, 'Epic Destiny')).toEqual([
      rows[0],
      rows[1],
      { kind: 'tierSeparator', label: 'Epic Destiny Tier' },
      rows[2],
    ])
  })

  it('does not insert a separator when extended levels are absent', () => {
    const rows: TableGridPresentationRow[] = [{ rowHeader: 20, cells: { xp: '355,000' } }]

    expect(withTierSeparatorAfterStandardMax(rows, 20, 'Epic Destiny')).toEqual(rows)
  })

  it('detects when the values grid should render a tier band', () => {
    expect(shouldRenderValuesTierSeparator(20, 20, 'Epic Destiny', 21)).toBe(true)
    expect(shouldRenderValuesTierSeparator(20, 20, 'Epic Destiny', 20)).toBe(false)
    expect(shouldRenderValuesTierSeparator(19, 20, 'Epic Destiny', 21)).toBe(false)
  })
})
