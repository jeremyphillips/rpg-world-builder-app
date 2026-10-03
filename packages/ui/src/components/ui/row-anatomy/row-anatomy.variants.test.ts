import { describe, expect, it } from 'vitest'

import type { RowAnatomyCellSpec } from './row-anatomy.types'
import { rowAnatomyCellClasses, rowAnatomyTracksVariants } from './row-anatomy.variants'

const SLOT_EXPECTATIONS: ReadonlyArray<[RowAnatomyCellSpec, string[]]> = [
  [{ slot: 'band', column: 'content' }, ['row-start-[band]', 'self-center']],
  [{ slot: 'meta', column: 'content' }, ['row-start-[meta]', 'self-start', 'mt-0.5']],
  [{ slot: 'status', column: 'trailing' }, ['row-start-[status]', 'self-start', 'mt-1']],
  [
    { slot: 'full', column: 'trailing' },
    ['row-start-[slack-start]', 'row-end-[row-end]', 'self-center'],
  ],
  [
    { slot: 'stretch', column: 'trailing' },
    ['row-start-[slack-start]', 'row-end-[row-end]', 'self-stretch'],
  ],
]

describe('rowAnatomyTracksVariants', () => {
  it('declares slack gutters around band, meta, and status tracks', () => {
    const classes = rowAnatomyTracksVariants()
    expect(classes).toContain(
      'grid-rows-[[slack-start]_1fr_[band]_minmax(var(--row-band-height),auto)_[meta]_auto_[status]_auto_[slack-end]_1fr_[row-end]]',
    )
    expect(classes).toContain('[--row-band-height:var(--control-action-compact-height)]')
  })

  it('maps media bands to identity frame heights', () => {
    expect(rowAnatomyTracksVariants({ band: 'media-xs' })).toContain(
      '[--row-band-height:calc(var(--spacing)*8)]',
    )
    expect(rowAnatomyTracksVariants({ band: 'media-sm' })).toContain(
      '[--row-band-height:calc(var(--spacing)*10)]',
    )
  })

  it('never emits column, gap, or padding classes', () => {
    for (const band of ['control', 'media-xs', 'media-sm'] as const) {
      const classes = rowAnatomyTracksVariants({ band })
      expect(classes).not.toMatch(/\bgrid-cols-|\bgap-|\bp[xytrbl]?-\d|\bcol-/)
    }
  })
})

describe('rowAnatomyCellClasses', () => {
  it.each(SLOT_EXPECTATIONS)('maps %o to one row placement and alignment', (cell, expected) => {
    const classes = rowAnatomyCellClasses(cell).split(' ')
    expect(classes).toEqual(expect.arrayContaining(expected))
    expect(classes.filter((token) => token.startsWith('self-'))).toHaveLength(1)
  })

  it('never emits horizontal placement or spacing', () => {
    for (const [cell] of SLOT_EXPECTATIONS) {
      expect(rowAnatomyCellClasses(cell)).not.toMatch(/\bcol-|\bjustify-|\bm[xlrse]-|\bp[xlrse]-/)
    }
  })
})
