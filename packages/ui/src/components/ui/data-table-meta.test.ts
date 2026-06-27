import { describe, expect, it } from 'vitest'

import { dataTableColumnWidths, dataTableWidthMeta } from './data-table-meta'

describe('dataTableWidthMeta', () => {
  it('returns matching header and cell classes for each preset', () => {
    expect(dataTableWidthMeta('compact')).toEqual({
      headerClassName: dataTableColumnWidths.compact,
      cellClassName: dataTableColumnWidths.compact,
    })
  })

  it('pins compact widths at lg only so mobile columns can shrink', () => {
    expect(dataTableColumnWidths.compact).toContain('lg:w-[120px]')
    expect(dataTableColumnWidths.compact).not.toMatch(/^w-\[120px\]/)
  })

  it('keeps image and minimal fixed at all breakpoints', () => {
    expect(dataTableColumnWidths.image).toBe('w-16 max-w-16')
    expect(dataTableColumnWidths.minimal).toBe('w-px')
  })

  it('includes compact center alignment preset', () => {
    expect(dataTableWidthMeta('compactCenter').cellClassName).toContain('text-center')
  })

  it('includes medium preset pinned at lg', () => {
    expect(dataTableWidthMeta('medium').cellClassName).toContain('lg:w-[160px]')
  })
})
