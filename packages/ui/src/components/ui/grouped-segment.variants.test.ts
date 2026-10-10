import { describe, expect, it } from 'vitest'

import { groupedDividerVariants } from './field-input-chrome.variants'
import {
  groupedSegmentShellClasses,
  resolveGroupedSegmentSurface,
  resolveGroupedValueSlotPadding,
} from './grouped-segment.variants'

describe('grouped-segment variants', () => {
  it('maps positional value-slot classes at md', () => {
    expect(resolveGroupedValueSlotPadding('md', 'start')).toContain(
      'ui-field-group__value-slot--start',
    )
    expect(resolveGroupedValueSlotPadding('md', 'start', { inset: 'compact' })).toContain(
      'ui-field-group__value-slot--start-compact',
    )
    expect(resolveGroupedValueSlotPadding('md', 'middle')).toContain(
      'ui-field-group__value-slot--middle',
    )
    expect(resolveGroupedValueSlotPadding('md', 'end')).toContain('ui-field-group__value-slot--end')
  })

  it('uses trailing-slot end padding when a sibling column follows', () => {
    expect(resolveGroupedValueSlotPadding('md', 'end', { trailing: 'slot' })).toContain(
      'ui-field-group__value-slot--end-slot',
    )
    expect(resolveGroupedValueSlotPadding('md', 'standalone', { trailing: 'slot' })).toContain(
      'ui-field-group__value-slot--standalone-slot',
    )
  })

  it('maps chromatic roles to shell surfaces', () => {
    expect(resolveGroupedSegmentSurface('value')).toBe('default')
    expect(resolveGroupedSegmentSurface('unit')).toBe('faint')
    expect(resolveGroupedSegmentSurface('glue')).toBe('faint')
  })

  it('does not infer surface from position — explicit surface only', () => {
    expect(groupedSegmentShellClasses('md', { position: 'end', surface: 'default' })).not.toContain(
      'ui-field-group__segment--surface-faint',
    )
    expect(groupedSegmentShellClasses('md', { position: 'middle', surface: 'faint' })).toContain(
      'ui-field-group__segment--surface-faint',
    )
  })

  it('applies corner radii only on outer positions', () => {
    expect(groupedSegmentShellClasses('md', { position: 'start', surface: 'default' })).toContain(
      'ui-field-group__segment--start',
    )
    expect(groupedSegmentShellClasses('md', { position: 'end', surface: 'faint' })).toContain(
      'ui-field-group__segment--end',
    )
    expect(
      groupedSegmentShellClasses('md', { position: 'middle', surface: 'faint' }),
    ).not.toContain('ui-field-group__segment--start')
    expect(
      groupedSegmentShellClasses('md', { position: 'middle', surface: 'faint' }),
    ).not.toContain('ui-field-group__segment--end')
  })

  it('exposes primary and subtle grouped divider strengths', () => {
    expect(groupedDividerVariants({ strength: 'primary' })).toContain(
      'ui-field-group__divider--primary',
    )
    expect(groupedDividerVariants({ strength: 'subtle' })).toContain(
      'ui-field-group__divider--subtle',
    )
  })
})
