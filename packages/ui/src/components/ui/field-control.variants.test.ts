import { describe, expect, it } from 'vitest'

import {
  UI_FIELD_CONTROL_BLOCK_CLASS,
  UI_FIELD_CONTROL_TRIGGER_CLASS,
  resolveFieldControlMultilineSizeClass,
  resolveFieldControlSizeClass,
} from './field-control.styles'
import {
  fieldControlTriggerVariants,
  fieldControlVariants,
  fieldWidthVariants,
  resolveFieldWidthClassName,
  textareaVariants,
} from './field-control.variants'

describe('fieldControlVariants', () => {
  it('maps md to ui-field-control block and size modifier', () => {
    const classes = fieldControlVariants({ size: 'md' })
    expect(classes).toContain(UI_FIELD_CONTROL_BLOCK_CLASS)
    expect(classes).toContain(resolveFieldControlSizeClass('md'))
  })

  it('maps textarea md to multiline modifier', () => {
    const classes = textareaVariants({ size: 'md' })
    expect(classes).toContain(UI_FIELD_CONTROL_BLOCK_CLASS)
    expect(classes).toContain(resolveFieldControlMultilineSizeClass('md'))
  })

  it('maps trigger shell to trigger modifier and size', () => {
    const classes = fieldControlTriggerVariants({ size: 'sm' })
    expect(classes).toContain(UI_FIELD_CONTROL_BLOCK_CLASS)
    expect(classes).toContain(UI_FIELD_CONTROL_TRIGGER_CLASS)
    expect(classes).toContain(resolveFieldControlSizeClass('sm'))
  })
})

describe('fieldWidthVariants', () => {
  it('maps intrinsic and proportional tokens to semantic width modifiers', () => {
    expect(fieldWidthVariants({ width: 'xs' })).toBe('ui-field-control--width-xs')
    expect(fieldWidthVariants({ width: 'sm' })).toBe('ui-field-control--width-sm')
    expect(fieldWidthVariants({ width: 'md' })).toBe('ui-field-control--width-md')
    expect(fieldWidthVariants({ width: 'lg' })).toBe('ui-field-control--width-lg')
    expect(fieldWidthVariants({ width: 'xl' })).toBe('ui-field-control--width-xl')
    expect(fieldWidthVariants({ width: 'auto' })).toBe('ui-field-control--width-auto')
    expect(fieldWidthVariants({ width: 'full' })).toBe('ui-field-control--width-full')
    expect(fieldWidthVariants({ width: '1/2' })).toBe('ui-field-control--width-1/2')
  })
})

describe('resolveFieldWidthClassName', () => {
  it('keeps flex fraction caps when not participating in an anatomy grid', () => {
    expect(resolveFieldWidthClassName('1/2')).toBe('ui-field-control--width-1/2')
    expect(resolveFieldWidthClassName('1/3')).toBe('ui-field-control--width-1/3')
    expect(resolveFieldWidthClassName('full')).toBe('ui-field-control--width-full')
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
      'w-fit min-w-min flex-none',
    )
  })
})
