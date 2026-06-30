import { describe, expect, it } from 'vitest'

import { fieldWidthVariants } from './field-control.variants'

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
