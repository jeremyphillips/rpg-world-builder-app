import { describe, expect, it } from 'vitest'

import {
  CANVAS_SURFACE,
  DEFAULT_ARRAY_ITEM_SURFACE,
  DEFAULT_FLAT_ARRAY_ITEM_SURFACE,
  DEFAULT_FLAT_NO_HEADER_ARRAY_ITEM_SURFACE,
} from '../../../components/ui/field-dependent.variants'
import { resolveArrayItemShellSurface } from './resolve-array-item-shell-surface.lib'

describe('resolveArrayItemShellSurface', () => {
  it('uses subtle wash for collapsible disclosure headers', () => {
    expect(
      resolveArrayItemShellSurface({
        collapsible: true,
      }),
    ).toEqual(DEFAULT_ARRAY_ITEM_SURFACE)
  })

  it('uses subtle wash for flat items with a visible header', () => {
    expect(
      resolveArrayItemShellSurface({
        collapsible: false,
        hasItemHeader: true,
      }),
    ).toEqual(DEFAULT_FLAT_ARRAY_ITEM_SURFACE)
  })

  it('uses faint wash for flat no-header items', () => {
    expect(
      resolveArrayItemShellSurface({
        collapsible: false,
        hasItemHeader: false,
      }),
    ).toEqual(DEFAULT_FLAT_NO_HEADER_ARRAY_ITEM_SURFACE)
  })

  it('honors explicit surface overrides', () => {
    expect(
      resolveArrayItemShellSurface({
        explicit: CANVAS_SURFACE,
        collapsible: false,
        hasItemHeader: false,
      }),
    ).toEqual(CANVAS_SURFACE)
  })
})
