import { describe, expect, it } from 'vitest'

import {
  UI_CHOICE_CONTROL_BLOCK_CLASS,
  UI_CHOICE_CONTROL_THUMB_CLASS,
  resolveChoiceControlKindClass,
  resolveChoiceControlIndicatorSizeClass,
} from './choice-control.styles'
import {
  checkboxControlClasses,
  radioCardDecorativeControlClasses,
  radioGroupItemControlClasses,
  switchControlClasses,
  switchThumbClasses,
} from './choice-control.variants'

describe('choiceControlClasses', () => {
  it('maps checkbox to block and kind modifier', () => {
    const classes = checkboxControlClasses()
    expect(classes).toContain(UI_CHOICE_CONTROL_BLOCK_CLASS)
    expect(classes).toContain(resolveChoiceControlKindClass('checkbox'))
    expect(classes).toContain('ui-focus-ring')
    expect(classes).not.toContain('ui-choice-control--circle')
  })

  it('maps circle appearance to circle modifier', () => {
    const classes = checkboxControlClasses({ appearance: 'circle' })
    expect(classes).toContain('ui-choice-control--circle')
    expect(classes).not.toContain('ui-choice-control--circle-expand')
  })

  it('adds the expand modifier only for circle checkboxes', () => {
    expect(checkboxControlClasses({ appearance: 'circle', expand: true })).toContain(
      'ui-choice-control--circle-expand',
    )
    expect(checkboxControlClasses({ expand: true })).not.toContain(
      'ui-choice-control--circle-expand',
    )
  })

  it('defaults checkbox focus to standalone and allows embedded for dense inline chrome', () => {
    expect(checkboxControlClasses()).not.toContain('ui-focus-ring--embedded')
    expect(checkboxControlClasses()).not.toContain('border-input')

    const embedded = checkboxControlClasses({ focusContext: 'embedded' })
    expect(embedded).toContain('ui-focus-ring')
    expect(embedded).toContain('ui-focus-ring--embedded')
  })

  it('maps radio group item to block and radio modifier', () => {
    const classes = radioGroupItemControlClasses()
    expect(classes).toContain(UI_CHOICE_CONTROL_BLOCK_CLASS)
    expect(classes).toContain(resolveChoiceControlKindClass('radio'))
  })

  it('maps switch track and thumb to semantic classes', () => {
    expect(switchControlClasses()).toContain(resolveChoiceControlKindClass('switch'))
    expect(switchThumbClasses()).toBe(UI_CHOICE_CONTROL_THUMB_CLASS)
  })

  it('maps radio card decoration to radio kind and indicator size', () => {
    const lg = radioCardDecorativeControlClasses({ indicatorSize: 'lg' })
    expect(lg).toContain(resolveChoiceControlKindClass('radio'))
    expect(lg).toContain(resolveChoiceControlIndicatorSizeClass('lg'))

    const sm = radioCardDecorativeControlClasses({ indicatorSize: 'sm' })
    expect(sm).toContain(resolveChoiceControlIndicatorSizeClass('sm'))
  })
})
