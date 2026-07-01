import { describe, expect, it } from 'vitest'

import {
  arrayItemActionsRailClasses,
  arrayItemDragHandleClasses,
  arrayItemMainClasses,
  arrayItemRemoveButtonClasses,
  arrayItemShellClasses,
  arrayItemToolbarRowClasses,
} from './array-item-toolbar.variants'

describe('array item shell variants', () => {
  it('uses a two-column grid with top-aligned actions and no right inset', () => {
    expect(arrayItemShellClasses).toContain('grid-cols-[minmax(0,1fr)_auto]')
    expect(arrayItemShellClasses).toContain('items-start')
    expect(arrayItemShellClasses).toContain('pr-0')
    expect(arrayItemMainClasses).toContain('pt-[calc(var(--spacing)*2)]')
    expect(arrayItemActionsRailClasses()).toContain('self-start')
    expect(arrayItemActionsRailClasses()).toContain('mt-2')
    expect(arrayItemActionsRailClasses()).toContain('mr-1')
    expect(arrayItemActionsRailClasses({ compact: true })).toContain('mt-1')
    expect(arrayItemDragHandleClasses({ compact: true })).toContain('-mt-1')
  })

  it('keeps remove on the shared chrome hit target', () => {
    expect(arrayItemRemoveButtonClasses).toContain('size-6')
  })

  it('does not place trailing actions in the leading toolbar row', () => {
    expect(arrayItemToolbarRowClasses()).not.toContain('ml-auto')
    expect(arrayItemToolbarRowClasses()).not.toContain('pr-2')
  })
})
