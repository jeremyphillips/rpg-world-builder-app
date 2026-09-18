import { describe, expect, it } from 'vitest'

import { groupedDividerVariants } from './field-input-chrome.variants'
import {
  groupedSegmentShellClasses,
  resolveGroupedSegmentSurface,
  resolveGroupedValueSlotPadding,
} from './grouped-segment.variants'

describe('grouped-segment variants', () => {
  it('maps positional value-slot padding at md', () => {
    expect(resolveGroupedValueSlotPadding('md', 'start')).toBe('ps-3')
    expect(resolveGroupedValueSlotPadding('md', 'start', { inset: 'compact' })).toBe('ps-2')
    expect(resolveGroupedValueSlotPadding('md', 'middle')).toBe('ps-2 pe-2')
    expect(resolveGroupedValueSlotPadding('md', 'end')).toBe('ps-2 pe-2.5')
  })

  it('uses trailing-slot end padding when a sibling column follows', () => {
    expect(resolveGroupedValueSlotPadding('md', 'end', { trailing: 'slot' })).toBe('ps-2 pe-1')
    expect(resolveGroupedValueSlotPadding('md', 'standalone', { trailing: 'slot' })).toBe(
      'ps-3 pe-1',
    )
  })

  it('maps chromatic roles to shell surfaces', () => {
    expect(resolveGroupedSegmentSurface('value')).toBe('default')
    expect(resolveGroupedSegmentSurface('unit')).toBe('faint')
    expect(resolveGroupedSegmentSurface('glue')).toBe('faint')
  })

  it('does not infer surface from position — explicit surface only', () => {
    expect(groupedSegmentShellClasses('md', { position: 'end', surface: 'default' })).not.toContain(
      'bg-surface-faint',
    )
    expect(groupedSegmentShellClasses('md', { position: 'middle', surface: 'faint' })).toContain(
      'bg-surface-faint',
    )
  })

  it('applies corner radii only on outer positions', () => {
    expect(groupedSegmentShellClasses('md', { position: 'start', surface: 'default' })).toContain(
      'rounded-l-md',
    )
    expect(groupedSegmentShellClasses('md', { position: 'end', surface: 'faint' })).toContain(
      'rounded-r-md',
    )
    expect(
      groupedSegmentShellClasses('md', { position: 'middle', surface: 'faint' }),
    ).not.toContain('rounded-l-md')
    expect(
      groupedSegmentShellClasses('md', { position: 'middle', surface: 'faint' }),
    ).not.toContain('rounded-r-md')
  })

  it('exposes primary and subtle grouped divider strengths', () => {
    expect(groupedDividerVariants({ strength: 'primary' })).toContain('bg-border')
    expect(groupedDividerVariants({ strength: 'subtle' })).toContain('bg-border-subtle')
  })
})
