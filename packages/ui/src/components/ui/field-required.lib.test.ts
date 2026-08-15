import { describe, expect, it } from 'vitest'
import { createElement, type ReactElement } from 'react'

import { Input } from './input.client'
import { NumberInput } from './number-input.client'
import { resolveControlRequiredProps, shouldShowVisibleRequiredMarker } from './field-required.lib'

type ControlElement = ReactElement<Record<string, unknown>>

function controlElement(
  type: Parameters<typeof createElement>[0],
  props?: Record<string, unknown>,
): ControlElement {
  return createElement(type, props) as ControlElement
}

describe('shouldShowVisibleRequiredMarker', () => {
  it('shows the marker for visible required labels', () => {
    expect(shouldShowVisibleRequiredMarker(true, 'visible')).toBe(true)
  })

  it('hides the marker for sr-only required labels', () => {
    expect(shouldShowVisibleRequiredMarker(true, 'srOnly')).toBe(false)
  })
})

describe('resolveControlRequiredProps', () => {
  it('sets native required on input elements', () => {
    expect(resolveControlRequiredProps(controlElement('input'), true)).toEqual({ required: true })
  })

  it('sets native required on Input and NumberInput forwarders', () => {
    expect(resolveControlRequiredProps(controlElement(Input), true)).toEqual({ required: true })
    expect(resolveControlRequiredProps(controlElement(NumberInput), true)).toEqual({
      required: true,
    })
  })

  it('sets aria-required on custom widgets', () => {
    expect(
      resolveControlRequiredProps(controlElement('button', { role: 'combobox' }), true),
    ).toEqual({
      'aria-required': true,
    })
  })

  it('does not override explicit required props', () => {
    expect(resolveControlRequiredProps(controlElement('input', { required: false }), true)).toEqual(
      {},
    )
  })
})
