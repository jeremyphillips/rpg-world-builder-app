import { describe, expect, it } from 'vitest'

import {
  arrayItemActionsRailClasses,
  arrayItemBodyClasses,
  arrayItemCompactRowClasses,
  arrayItemDragHandleClasses,
  arrayItemMainClasses,
  arrayItemRemoveButtonClasses,
  arrayItemShellClasses,
  arrayItemShellVariants,
  arrayItemToolbarContentClasses,
  arrayItemToolbarRowClasses,
  buildArrayItemCompactRowGridTemplate,
} from './array-item-toolbar.variants'
import { fieldSurfaceToneVariants } from '../../components/ui/field-stack.variants'

describe('array item shell variants', () => {
  it('uses a two-column grid with top-aligned actions and shell padding', () => {
    expect(arrayItemShellClasses).toContain('grid-cols-[minmax(0,1fr)_auto]')
    expect(arrayItemShellClasses).toContain('items-start')
    expect(arrayItemShellClasses).toContain('pr-3')
    expect(arrayItemShellClasses).toContain('pb-3')
    expect(arrayItemMainClasses).toContain('pt-[calc(var(--spacing)*2)]')
    expect(arrayItemActionsRailClasses()).toContain('self-start')
    expect(arrayItemActionsRailClasses()).toContain('mt-2')
    expect(arrayItemActionsRailClasses()).not.toContain('mr-1')
    expect(arrayItemActionsRailClasses({ compact: true })).toContain('mt-1')
    expect(arrayItemDragHandleClasses({ compact: true })).toContain('-mt-1')
  })

  it('keeps remove on the shared chrome hit target', () => {
    expect(arrayItemRemoveButtonClasses).toContain('size-6')
  })

  it('does not place trailing actions in the leading toolbar row', () => {
    expect(arrayItemToolbarRowClasses({ showDragHandle: false, collapsible: false })).not.toContain(
      'ml-auto',
    )
    expect(arrayItemToolbarRowClasses({ showDragHandle: false, collapsible: false })).not.toContain(
      'pr-2',
    )
  })

  it('does not use negative margin hacks on the drag handle', () => {
    expect(arrayItemDragHandleClasses()).not.toContain('-ml-')
  })

  it('aligns grip-only and caret-only toolbar content with the same leading chrome inset', () => {
    const gripOnly = arrayItemToolbarContentClasses({
      showDragHandle: true,
      collapsible: false,
    })
    const caretOnly = arrayItemToolbarContentClasses({
      showDragHandle: false,
      collapsible: true,
    })

    expect(gripOnly).toBe(caretOnly)
    expect(gripOnly).toContain('pl-[calc(var(--spacing)*1)]')
  })

  it('uses flex for the leading toolbar row so chrome aligns with title copy', () => {
    expect(arrayItemToolbarRowClasses({ showDragHandle: true, collapsible: false })).toContain(
      'flex',
    )
    expect(arrayItemToolbarRowClasses({ showDragHandle: true, collapsible: false })).toContain(
      'items-center',
    )
  })

  it('derives body indent from chrome count via shell CSS variable', () => {
    expect(arrayItemBodyClasses({ showDragHandle: true, collapsible: false })).toContain(
      '--array-item-chrome-count',
    )
    expect(arrayItemBodyClasses({ showDragHandle: true, collapsible: true })).toContain(
      '--array-item-chrome-count',
    )
  })

  it('applies shared surface tone classes when tone is set', () => {
    expect(arrayItemShellVariants({ tone: 'default' })).not.toContain('bg-muted/30')
    const classes = arrayItemShellVariants({ tone: 'subtle' })
    expect(classes).toContain(fieldSurfaceToneVariants({ tone: 'subtle' }))
    expect(classes).toContain('bg-muted/10')
  })

  it('uses a single-column shell for compact inline rows', () => {
    expect(arrayItemShellVariants({ layout: 'compactRow' })).toContain('pr-3')
    expect(arrayItemShellVariants({ layout: 'compactRow' })).toContain('pb-3')
    expect(arrayItemShellVariants({ layout: 'compactRow' })).not.toContain('grid-cols-')
  })

  it('builds compact row grid templates with a reserved actions column', () => {
    expect(buildArrayItemCompactRowGridTemplate(2, true)).toBe(
      'auto repeat(2, minmax(0, 1fr)) max-content',
    )
    expect(buildArrayItemCompactRowGridTemplate(3, false)).toBe(
      'repeat(3, minmax(0, 1fr)) max-content',
    )
    expect(arrayItemCompactRowClasses).toContain('grid')
    expect(arrayItemActionsRailClasses({ embedded: true })).toContain('justify-self-end')
    expect(arrayItemActionsRailClasses({ embedded: true })).not.toContain('mt-1')
  })
})
