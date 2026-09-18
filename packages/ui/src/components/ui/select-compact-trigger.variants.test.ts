import { describe, expect, it } from 'vitest'

import {
  groupedEndLabelSegmentShellClasses,
  groupedSelectSegmentShellClasses,
  groupedValueSlotClasses,
  selectCaretSlotWidthClasses,
  selectDigitValueMinWidthVariants,
  selectTriggerShellClasses,
} from './select-compact-trigger.variants'

describe('select-compact-trigger variants', () => {
  it('keeps caret slot width fixed by size token', () => {
    expect(selectCaretSlotWidthClasses.md).toBe('w-8')
    expect(selectCaretSlotWidthClasses.lg).toBe('w-9')
  })

  it('uses height-only grouped select shells with p-0', () => {
    expect(groupedSelectSegmentShellClasses('md', 'end', { surfaceRole: 'unit' })).toContain('h-9')
    expect(groupedSelectSegmentShellClasses('md', 'end', { surfaceRole: 'unit' })).toContain('p-0')
    expect(groupedSelectSegmentShellClasses('md', 'end', { surfaceRole: 'unit' })).toContain(
      'bg-surface-faint',
    )
    expect(groupedSelectSegmentShellClasses('md', 'end', { surfaceRole: 'unit' })).not.toContain(
      'py-1.5',
    )
  })

  it('uses height-only standalone select shells with px-0 py-0', () => {
    expect(selectTriggerShellClasses('md', { grouped: false, groupedPosition: 'end' })).toContain(
      'py-0',
    )
    expect(selectTriggerShellClasses('md', { grouped: false, groupedPosition: 'end' })).toContain(
      'px-0',
    )
  })

  it('applies digit min-width only in the value slot', () => {
    const classes = groupedValueSlotClasses('md', { position: 'start', digits: 2 })
    expect(classes).toContain(selectDigitValueMinWidthVariants[2])
    expect(classes).toContain('tabular-nums')
    expect(classes).toContain('ps-3')
    expect(classes).not.toContain('pe-1')
  })

  it('uses end trailing-slot padding for grouped end selects', () => {
    const classes = groupedValueSlotClasses('md', {
      position: 'end',
      trailing: 'slot',
      textSizing: true,
    })
    expect(classes).toContain('grid')
    expect(classes).toContain('ps-2')
    expect(classes).toContain('pe-1')
    expect(classes).not.toContain('pe-2.5')
  })

  it('uses end content padding for grouped label value slots', () => {
    const classes = groupedValueSlotClasses('md', { position: 'end', trailing: 'content' })
    expect(classes).toContain('ps-2')
    expect(classes).toContain('pe-2.5')
  })

  it('uses end label segment shells with p-0', () => {
    expect(groupedEndLabelSegmentShellClasses('md')).toContain('p-0')
    expect(groupedEndLabelSegmentShellClasses('md')).toContain('h-9')
  })

  it('uses flex-1 for prose value slots', () => {
    const classes = groupedValueSlotClasses('md', { position: 'standalone', prose: true })
    expect(classes).toContain('flex-1')
    expect(classes).toContain('ps-3')
  })
})
