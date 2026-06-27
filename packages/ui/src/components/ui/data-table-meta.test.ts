import { describe, expect, it } from 'vitest'

import {
  dataTableCellTypography,
  dataTableColumnWidths,
  dataTableTypographyMeta,
  dataTableWidthMeta,
} from './data-table-meta'

describe('dataTableWidthMeta', () => {
  it('returns matching header and cell classes for each preset', () => {
    expect(dataTableWidthMeta('compact')).toEqual({
      headerClassName: dataTableColumnWidths.compact,
      cellClassName: dataTableColumnWidths.compact,
    })
  })

  it('pins compact widths at lg only so mobile columns can shrink', () => {
    expect(dataTableColumnWidths.compact).toContain('lg:w-24')
    expect(dataTableColumnWidths.compact).not.toMatch(/^w-24/)
  })

  it('keeps image and minimal fixed at all breakpoints', () => {
    expect(dataTableColumnWidths.image).toBe('w-16 max-w-16')
    expect(dataTableColumnWidths.minimal).toBe('w-px')
  })

  it('includes compact center alignment preset', () => {
    expect(dataTableWidthMeta('compactCenter').headerClassName).toContain('text-center')
    expect(dataTableWidthMeta('compactCenter').cellClassName).toContain('[&>svg]:mx-auto')
  })

  it('includes medium preset pinned at lg', () => {
    expect(dataTableWidthMeta('medium').cellClassName).toContain('lg:w-36')
  })
})

describe('dataTableTypographyMeta', () => {
  it('returns cellClassName for each typography preset', () => {
    expect(dataTableTypographyMeta('meta')).toEqual({
      cellClassName: dataTableCellTypography.meta,
    })
  })

  it('includes meta typography tokens', () => {
    expect(dataTableCellTypography.meta).toContain('text-badge-sm')
    expect(dataTableCellTypography.meta).toContain('font-meta')
    expect(dataTableCellTypography.meta).not.toContain('italic')
  })

  it('includes metaItalic typography tokens', () => {
    expect(dataTableCellTypography.metaItalic).toContain('text-badge-sm')
    expect(dataTableCellTypography.metaItalic).toContain('font-meta')
    expect(dataTableCellTypography.metaItalic).toContain('italic')
  })

  it('includes stat typography tokens', () => {
    expect(dataTableCellTypography.stat).toContain('text-table-stat')
    expect(dataTableCellTypography.stat).toContain('font-data-stat')
    expect(dataTableCellTypography.stat).toContain('text-foreground')
  })
})
