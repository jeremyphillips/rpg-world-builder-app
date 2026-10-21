import { describe, expect, it } from 'vitest'

import type { RowAnatomyCellSpec } from './row-anatomy.types'
import { rowAnatomyCellClasses, rowAnatomyTracksVariants } from './row-anatomy.variants'

const SLOT_EXPECTATIONS: ReadonlyArray<[RowAnatomyCellSpec, string[]]> = [
  [
    { slot: 'band', column: 'content' },
    ['ui-row-anatomy__cell--band', 'ui-row-anatomy__cell--content'],
  ],
  [
    { slot: 'meta', column: 'content' },
    ['ui-row-anatomy__cell--meta', 'ui-row-anatomy__cell--content'],
  ],
  [
    { slot: 'status', column: 'trailing' },
    ['ui-row-anatomy__cell--status', 'ui-row-anatomy__cell--trailing'],
  ],
  [
    { slot: 'full', column: 'trailing' },
    ['ui-row-anatomy__cell--full', 'ui-row-anatomy__cell--trailing'],
  ],
  [
    { slot: 'stretch', column: 'trailing' },
    ['ui-row-anatomy__cell--stretch', 'ui-row-anatomy__cell--trailing'],
  ],
]

describe('rowAnatomyTracksVariants', () => {
  it('emits ui-row-anatomy block and band modifiers', () => {
    const classes = rowAnatomyTracksVariants()
    expect(classes).toContain('ui-row-anatomy')
    expect(classes).toContain('ui-row-anatomy--band-control')
  })

  it('maps media bands to identity frame height modifiers', () => {
    expect(rowAnatomyTracksVariants({ band: 'media-xs' })).toContain(
      'ui-row-anatomy--band-media-xs',
    )
    expect(rowAnatomyTracksVariants({ band: 'media-sm' })).toContain(
      'ui-row-anatomy--band-media-sm',
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
  it.each(SLOT_EXPECTATIONS)('maps %o to slot and column cell modifiers', (cell, expected) => {
    const classes = rowAnatomyCellClasses(cell).split(' ')
    expect(classes).toEqual(expect.arrayContaining(expected))
    expect(classes).toContain('ui-row-anatomy__cell')
  })

  it('never emits horizontal placement or spacing utilities', () => {
    for (const [cell] of SLOT_EXPECTATIONS) {
      expect(rowAnatomyCellClasses(cell)).not.toMatch(/\bcol-|\bjustify-|\bm[xlrse]-|\bp[xlrse]-/)
    }
  })
})
