import { describe, expect, it } from 'vitest'

import { fieldWidthVariants, resolveFieldWidthClassName } from './field-control.variants'

describe('fieldWidthVariants', () => {
  it('adds explicit row widths for intrinsic xs–xl tokens', () => {
    expect(fieldWidthVariants({ width: 'xs' })).toContain('in-data-[field-row]:w-16')
    expect(fieldWidthVariants({ width: 'sm' })).toContain('in-data-[field-row]:w-24')
    expect(fieldWidthVariants({ width: 'md' })).toContain('in-data-[field-row]:w-36')
    expect(fieldWidthVariants({ width: 'lg' })).toContain('in-data-[field-row]:w-48')
    expect(fieldWidthVariants({ width: 'xl' })).toContain('in-data-[field-row]:w-64')
  })

  it('leaves auto and proportional tokens unchanged', () => {
    expect(fieldWidthVariants({ width: 'auto' })).toBe('w-fit flex-none')
    expect(fieldWidthVariants({ width: 'full' })).toBe('w-full flex-1')
    expect(fieldWidthVariants({ width: '1/2' })).not.toContain('in-data-[field-row]')
  })
})

describe('resolveFieldWidthClassName', () => {
  it('keeps flex fraction caps when not participating in an anatomy grid', () => {
    expect(resolveFieldWidthClassName('1/2')).toContain('max-w-1/2')
    expect(resolveFieldWidthClassName('1/3')).toContain('max-w-1/3')
    expect(resolveFieldWidthClassName('full')).toBe('w-full flex-1')
  })

  it('drops fraction max-width when participating so the grid track owns sizing', () => {
    expect(resolveFieldWidthClassName('1/2', { rowParticipation: true })).toBe('min-w-0 w-full')
    expect(resolveFieldWidthClassName('1/3', { rowParticipation: true })).toBe('min-w-0 w-full')
    expect(resolveFieldWidthClassName('full', { rowParticipation: true })).toBe('min-w-0 w-full')
  })

  it('keeps fixed and auto classes under row participation', () => {
    expect(resolveFieldWidthClassName('lg', { rowParticipation: true })).toBe(
      fieldWidthVariants({ width: 'lg' }),
    )
    expect(resolveFieldWidthClassName('auto', { rowParticipation: true })).toBe(
      fieldWidthVariants({ width: 'auto' }),
    )
  })
})
