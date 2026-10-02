import { describe, expect, it } from 'vitest'

import {
  numberStepperButtonVariants,
  numberStepperRootVariants,
  numberStepperWidthVariants,
  resolveNumberStepperSize,
  resolveNumberStepperSizeFromFieldSize,
} from './number-stepper.variants'

describe('numberStepperWidthVariants', () => {
  it('uses 3rem side columns for xs and 4rem for sm/md/lg', () => {
    expect(numberStepperWidthVariants.xs[1]).toBe('w-[calc(1*1ch+3rem)]')
    expect(numberStepperWidthVariants.sm[1]).toBe('w-[calc(1*1ch+4rem)]')
    expect(numberStepperWidthVariants.md[3]).toBe('w-[calc(3*1ch+4rem)]')
    expect(numberStepperWidthVariants.lg[5]).toBe('w-[calc(5*1ch+4rem)]')
  })

  it('pairs stepper buttons with tier-appropriate hit targets', () => {
    expect(numberStepperButtonVariants({ size: 'xs' })).toContain('size-6')
    expect(numberStepperButtonVariants({ size: 'sm' })).toContain('size-8')
    expect(numberStepperButtonVariants({ size: 'md' })).toContain('[&_svg]:size-icon-glyph-md')
    expect(numberStepperButtonVariants({ size: 'lg' })).toContain('size-9')
  })
})

describe('resolveNumberStepperSizeFromFieldSize', () => {
  it('maps field sm/md/lg to sm/md/lg stepper tiers', () => {
    expect(resolveNumberStepperSizeFromFieldSize('sm')).toBe('sm')
    expect(resolveNumberStepperSizeFromFieldSize('md')).toBe('md')
    expect(resolveNumberStepperSizeFromFieldSize('lg')).toBe('lg')
  })

  it('prefers an explicit size override', () => {
    expect(resolveNumberStepperSize('xs', 'md')).toBe('xs')
    expect(resolveNumberStepperSize(undefined, 'sm')).toBe('sm')
  })
})

describe('numberStepperRootVariants', () => {
  it('assigns the four stepper heights', () => {
    expect(numberStepperRootVariants({ size: 'xs' })).toContain('h-6')
    expect(numberStepperRootVariants({ size: 'sm' })).toContain('h-8')
    expect(numberStepperRootVariants({ size: 'md' })).toContain('h-9')
    expect(numberStepperRootVariants({ size: 'lg' })).toContain('h-10')
  })
})
