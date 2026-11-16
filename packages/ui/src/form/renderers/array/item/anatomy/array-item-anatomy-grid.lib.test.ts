import { describe, expect, it } from 'vitest'

import type { FieldWidth } from '../../../../../components/ui/field-control.variants'
import { resolveFieldRowColumnTracks } from '../../../../../components/ui/field-row-column-tracks.lib'
import {
  ARRAY_ITEM_ANATOMY_CONTROL_TRACK_ROW,
  ARRAY_ITEM_CHROME_GAP_CLASS,
  ARRAY_ITEM_FIELD_GAP_DENSE_CLASS,
  ARRAY_ITEM_FIELD_GAP_DEFAULT_CLASS,
  arrayItemAnatomyGridVariants,
  buildArrayItemAnatomyFieldsClusterTemplateColumns,
  resolveArrayItemAnatomyFieldGridColumn,
  resolveArrayItemAnatomyParentChromeColumn,
  resolveArrayItemAnatomyGridPresentation,
  resolveArrayItemFieldGapClass,
  resolveArrayItemAnatomyFieldColumnTracks,
} from './array-item-anatomy-grid.variants'

describe('array-item-anatomy-grid', () => {
  it('owns a three-row track template on one parent grid', () => {
    expect(arrayItemAnatomyGridVariants).toContain('grid-rows-[auto_auto_auto]')
    expect(arrayItemAnatomyGridVariants).toContain('array-item-anatomy-grid')
  })

  it('resolves parent chrome column indices for two-tier layout', () => {
    expect(ARRAY_ITEM_ANATOMY_CONTROL_TRACK_ROW).toBe(2)
    expect(resolveArrayItemAnatomyParentChromeColumn({ role: 'grip', showGrip: true })).toBe(1)
    expect(resolveArrayItemAnatomyParentChromeColumn({ role: 'cluster', showGrip: true })).toBe(2)
    expect(resolveArrayItemAnatomyParentChromeColumn({ role: 'actions', showGrip: true })).toBe(3)
    expect(resolveArrayItemAnatomyParentChromeColumn({ role: 'actions', showGrip: false })).toBe(2)
  })

  it('maps fieldGap dense and default to array column-gap classes', () => {
    expect(resolveArrayItemFieldGapClass('dense')).toBe(ARRAY_ITEM_FIELD_GAP_DENSE_CLASS)
    expect(resolveArrayItemFieldGapClass('default')).toBe(ARRAY_ITEM_FIELD_GAP_DEFAULT_CLASS)
    expect(ARRAY_ITEM_FIELD_GAP_DENSE_CLASS).toBe('gap-x-3')
    expect(ARRAY_ITEM_FIELD_GAP_DEFAULT_CLASS).toBe('gap-x-4')
    expect(ARRAY_ITEM_CHROME_GAP_CLASS).toBe('gap-x-2')
  })

  it('keeps full tracks shrinkable and uses intrinsic auto tracks', () => {
    const widths: FieldWidth[] = ['md', 'auto', 'full']
    const { tracks } = resolveFieldRowColumnTracks(widths)
    const resolved = resolveArrayItemAnatomyFieldColumnTracks(widths)

    expect(resolved[0]).toBe(tracks[0])
    expect(resolved[1]).toBe('minmax(min-content, max-content)')
    expect(resolved[2]).toBe('minmax(0, 1fr)')
  })

  it('builds fields-cluster column tracks', () => {
    const widths: FieldWidth[] = ['md', 'auto']

    expect(buildArrayItemAnatomyFieldsClusterTemplateColumns(widths)).toBe(
      '9rem minmax(min-content, max-content)',
    )
  })

  it('places field columns within the fields cluster (1-based)', () => {
    expect(resolveArrayItemAnatomyFieldGridColumn(0, true)).toBe(1)
    expect(resolveArrayItemAnatomyFieldGridColumn(1, true)).toBe(2)
    expect(resolveArrayItemAnatomyFieldGridColumn(0, false)).toBe(1)
  })

  it('resolves presentation with chrome gap, fields-cluster parent template, and field gap class', () => {
    const widths: FieldWidth[] = ['md', 'auto']
    const presentation = resolveArrayItemAnatomyGridPresentation(widths, {
      showGrip: true,
      fieldGap: 'dense',
    })

    expect(presentation.className).toContain(ARRAY_ITEM_CHROME_GAP_CLASS)
    expect(presentation.className).toContain('ui-array-item-anatomy--grip')
    expect(presentation.fieldGapClass).toBe(ARRAY_ITEM_FIELD_GAP_DENSE_CLASS)
  })
})
