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
  it('keeps caret slot on semantic field-group caret class', () => {
    expect(selectCaretSlotWidthClasses.md).toContain('ui-field-group__caret-slot')
  })

  it('uses height-only grouped select shells with p-0', () => {
    expect(groupedSelectSegmentShellClasses('md', 'end', { surfaceRole: 'unit' })).toContain(
      'ui-field-group__segment',
    )
    expect(groupedSelectSegmentShellClasses('md', 'end', { surfaceRole: 'unit' })).toContain(
      'ui-field-group--md',
    )
    expect(groupedSelectSegmentShellClasses('md', 'end', { surfaceRole: 'unit' })).toContain(
      'ui-field-group__segment--surface-faint',
    )
    expect(groupedSelectSegmentShellClasses('md', 'end', { surfaceRole: 'unit' })).not.toContain(
      'py-1.5',
    )
  })

  it('uses semantic trigger shell for standalone selects', () => {
    expect(selectTriggerShellClasses('md', { grouped: false, groupedPosition: 'end' })).toContain(
      'ui-field-control--trigger',
    )
    expect(selectTriggerShellClasses('md', { grouped: false, groupedPosition: 'end' })).toContain(
      'ui-field-control--md',
    )
  })

  it('applies digit min-width only in the value slot', () => {
    const classes = groupedValueSlotClasses('md', { position: 'start', digits: 2 })
    expect(classes).toContain(selectDigitValueMinWidthVariants[2])
    expect(classes).toContain('tabular-nums')
    expect(classes).toContain('ui-field-group__value-slot--start')
    expect(classes).not.toContain('pe-1')
  })

  it('uses end trailing-slot padding for grouped end selects', () => {
    const classes = groupedValueSlotClasses('md', {
      position: 'end',
      trailing: 'slot',
      textSizing: true,
    })
    expect(classes).toContain('grid')
    expect(classes).toContain('ui-field-group__value-slot--end-slot')
    expect(classes).not.toContain('pe-2.5')
  })

  it('uses end content padding for grouped label value slots', () => {
    const classes = groupedValueSlotClasses('md', { position: 'end', trailing: 'content' })
    expect(classes).toContain('ui-field-group__value-slot--end')
  })

  it('uses end label segment shells with semantic segment class', () => {
    expect(groupedEndLabelSegmentShellClasses('md')).toContain('ui-field-group__segment')
    expect(groupedEndLabelSegmentShellClasses('md')).toContain('ui-field-group--md')
  })

  it('uses flex-1 for prose value slots', () => {
    const classes = groupedValueSlotClasses('md', { position: 'standalone', prose: true })
    expect(classes).toContain('flex-1')
    expect(classes).toContain('ui-field-group__value-slot--standalone')
  })
})
