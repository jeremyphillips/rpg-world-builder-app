import { describe, expect, it } from 'vitest'

import {
  dataTableCellTypography,
  dataTableColumnChromeMeta,
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

  it('sizes image column to thumbnail dimensions (+ padding)', () => {
    expect(dataTableColumnWidths.image).toContain('w-10')
    expect(dataTableColumnWidths.image).toContain('lg:w-12')
    expect(dataTableWidthMeta('image').cellClassName).toContain('overflow-visible')
  })

  it('keeps title columns fluid without fixed caps', () => {
    expect(dataTableColumnWidths.title).toBe('min-w-0')
    expect(dataTableWidthMeta('title').cellClassName).toBe('min-w-0')
  })

  it('keeps minimal column shrink-to-fit', () => {
    expect(dataTableColumnWidths.minimal).toBe('w-px')
  })

  it('pins actions column with sticky trailing chrome', () => {
    const meta = dataTableWidthMeta('actions')
    expect(meta.headerClassName).toContain('sticky')
    expect(meta.headerClassName).toContain('bg-surface-strong')
    expect(meta.cellClassName).toContain('sticky')
    expect(meta.cellClassName).toContain('bg-background')
  })

  it('sizes select column for checkbox control and centers it', () => {
    const meta = dataTableWidthMeta('select')
    expect(dataTableColumnWidths.select).toContain('w-10')
    expect(meta.headerClassName).toContain('text-center')
    expect(meta.cellClassName).toContain('[&_[role=checkbox]]:mx-auto')
  })

  it('includes compact center alignment preset', () => {
    expect(dataTableWidthMeta('compactCenter').headerClassName).toContain('text-center')
    expect(dataTableWidthMeta('compactCenter').cellClassName).toContain('[&>svg]:mx-auto')
  })

  it('includes medium preset pinned at lg', () => {
    expect(dataTableWidthMeta('medium').cellClassName).toContain('lg:w-36')
  })

  it('centers collection count columns', () => {
    expect(dataTableWidthMeta('collectionCount').headerClassName).toContain('text-center')
    expect(dataTableWidthMeta('collectionCount').cellClassName).toContain('lg:w-[5.5rem]')
  })

  it('sizes wide collection count columns for descriptive headers', () => {
    expect(dataTableWidthMeta('collectionCountWide').headerClassName).toContain('text-center')
    expect(dataTableWidthMeta('collectionCountWide').cellClassName).toContain('lg:w-36')
  })
})

describe('dataTableColumnChromeMeta', () => {
  it('merges width and typography cell classes', () => {
    const meta = dataTableColumnChromeMeta('medium', 'stat')
    expect(meta.headerClassName).toBe(dataTableWidthMeta('medium').headerClassName)
    expect(meta.cellClassName).toContain('lg:w-36')
    expect(meta.cellClassName).toContain(dataTableCellTypography.stat)
  })

  it('returns width meta when typography is omitted', () => {
    expect(dataTableColumnChromeMeta('tiny')).toEqual(dataTableWidthMeta('tiny'))
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
