import { describe, expect, it } from 'vitest'

import type { FieldWidth } from '../../../components/ui/field-control.variants'
import { resolveFieldRowColumnTracks } from '../../../components/ui/field-row-column-tracks.lib'
import { LEADING_CHROME_SIZE_VAR } from '../../../components/ui/collapsible-list-item/collapsible-list-item-leading-chrome.lib'
import {
  ARRAY_ITEM_ANATOMY_CONTROL_TRACK_ROW,
  ARRAY_ITEM_ANATOMY_GRIP_COLUMN_TRACK,
  arrayItemAnatomyGridVariants,
  buildArrayItemAnatomyGridTemplateColumns,
  resolveArrayItemAnatomyFieldGridColumn,
  resolveArrayItemAnatomyGridChromeColumn,
  resolveArrayItemAnatomyGridPresentation,
} from './array-item-anatomy-grid.variants'

describe('array-item-anatomy-grid', () => {
  it('owns a three-row track template on one parent grid', () => {
    expect(arrayItemAnatomyGridVariants()).toContain('grid-rows-[auto_auto_auto]')
    expect(arrayItemAnatomyGridVariants()).toContain('array-item-anatomy-grid')
  })

  it('resolves chrome column indices on the shared anatomy grid', () => {
    expect(ARRAY_ITEM_ANATOMY_CONTROL_TRACK_ROW).toBe(2)
    expect(
      resolveArrayItemAnatomyGridChromeColumn({ role: 'grip', fieldCount: 2, showGrip: true }),
    ).toBe(1)
    expect(
      resolveArrayItemAnatomyGridChromeColumn({ role: 'actions', fieldCount: 2, showGrip: true }),
    ).toBe(4)
    expect(
      resolveArrayItemAnatomyGridChromeColumn({ role: 'actions', fieldCount: 2, showGrip: false }),
    ).toBe(3)
  })

  it('builds column tracks as fixed grip, shrinkable field widths, and actions', () => {
    const widths: FieldWidth[] = ['md', 'auto']
    const { tracks } = resolveFieldRowColumnTracks(widths)

    expect(buildArrayItemAnatomyGridTemplateColumns(widths, true)).toBe(
      `${ARRAY_ITEM_ANATOMY_GRIP_COLUMN_TRACK} ${tracks[0]} minmax(0, 1fr) max-content`,
    )
    expect(buildArrayItemAnatomyGridTemplateColumns(widths, false)).toBe(
      `${tracks[0]} minmax(0, 1fr) max-content`,
    )
  })

  it('places field columns after the grip column', () => {
    expect(resolveArrayItemAnatomyFieldGridColumn(0, true)).toBe(2)
    expect(resolveArrayItemAnatomyFieldGridColumn(1, true)).toBe(3)
    expect(resolveArrayItemAnatomyFieldGridColumn(0, false)).toBe(1)
  })

  it('resolves presentation with leading-chrome size vars and no nested row templates', () => {
    const widths: FieldWidth[] = ['md', 'auto']
    const presentation = resolveArrayItemAnatomyGridPresentation(widths, {
      showGrip: true,
      gap: 'compact',
    })

    expect(presentation.className).toContain('gap-x-4')
    expect(presentation.style.gridTemplateColumns).toBe(
      buildArrayItemAnatomyGridTemplateColumns(widths, true),
    )
    expect(presentation.style[LEADING_CHROME_SIZE_VAR as keyof typeof presentation.style]).toBe(
      'calc(var(--spacing)*6)',
    )
  })
})
