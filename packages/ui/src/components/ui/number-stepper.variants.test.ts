import { describe, expect, it } from 'vitest'

import {
  numberStepperButtonVariants,
  numberStepperRootVariants,
  numberStepperValueSlotWidthPx,
  numberStepperWidthVariants,
  resolveNumberStepperSize,
  resolveNumberStepperSizeFromFieldSize,
} from './number-stepper.variants'

describe('numberStepperWidthVariants', () => {
  it('uses fixed value-slot px and tier side columns', () => {
    expect(numberStepperWidthVariants.xs[1]).toBe(
      `w-[calc(${numberStepperValueSlotWidthPx.xs[1]}px+3rem)]`,
    )
    expect(numberStepperWidthVariants.sm[2]).toBe(
      `w-[calc(${numberStepperValueSlotWidthPx.sm[2]}px+4rem)]`,
    )
    expect(numberStepperWidthVariants.md[2]).toBe(
      `w-[calc(${numberStepperValueSlotWidthPx.md[2]}px+4rem)]`,
    )
    expect(numberStepperWidthVariants.lg[5]).toBe(
      `w-[calc(${numberStepperValueSlotWidthPx.lg[5]}px+4rem)]`,
    )
  })

  it('pairs stepper buttons with tier-appropriate hit targets', () => {
    expect(numberStepperButtonVariants({ size: 'xs' })).toContain('size-6')
    expect(numberStepperButtonVariants({ size: 'sm' })).toContain('size-8')
    expect(numberStepperButtonVariants({ size: 'md' })).toContain('[&_svg]:size-icon-glyph-md')
    expect(numberStepperButtonVariants({ size: 'lg' })).toContain('size-9')
  })

  it('uses background hover and sunken disabled treatment on stepper buttons', () => {
    const classes = numberStepperButtonVariants({ size: 'md' })
    expect(classes).toContain('hover:bg-background')
    expect(classes).toContain('disabled:bg-sunken')
    expect(classes).toContain('disabled:text-input-disabled')
    expect(classes).toContain('disabled:[&_svg]:text-input-disabled')
    expect(classes).not.toContain('disabled:opacity-40')
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
