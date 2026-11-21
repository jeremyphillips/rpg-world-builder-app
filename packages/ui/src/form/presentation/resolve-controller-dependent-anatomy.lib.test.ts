import { describe, expect, it } from 'vitest'

import {
  resolveControllerDependentAnatomy,
  resolveDependentNestAlignmentClass,
} from './resolve-controller-dependent-anatomy.lib'
import {
  DEPENDENT_NEST_ALIGN_FIELD_EDGE_CLASS,
  DEPENDENT_NEST_ALIGN_INLINE_CHECKBOX_CLASS,
  DEPENDENT_NEST_ALIGN_INLINE_SWITCH_CLASS,
} from '../../components/ui/field-dependent-alignment.constants'
import type { FieldConfig } from '../field-config'

describe('resolveControllerDependentAnatomy', () => {
  it('classifies default inline switches', () => {
    const controller: FieldConfig = { type: 'switch', name: 'enabled', label: 'Enable' }
    expect(resolveControllerDependentAnatomy(controller)).toBe('inline-leading-switch')
    expect(resolveDependentNestAlignmentClass('inline-leading-switch')).toBe(
      DEPENDENT_NEST_ALIGN_INLINE_SWITCH_CLASS,
    )
  })

  it('classifies settings and above switches as field-edge', () => {
    expect(
      resolveControllerDependentAnatomy({
        type: 'switch',
        name: 'a',
        label: 'A',
        labelPosition: 'settings',
      }),
    ).toBe('field-edge')
    expect(
      resolveControllerDependentAnatomy({
        type: 'switch',
        name: 'b',
        label: 'B',
        labelPosition: 'above',
      }),
    ).toBe('field-edge')
  })

  it('classifies checkbox and boolean as inline checkbox', () => {
    expect(resolveControllerDependentAnatomy({ type: 'checkbox', name: 'c', label: 'C' })).toBe(
      'inline-leading-checkbox',
    )
    expect(resolveDependentNestAlignmentClass('inline-leading-checkbox')).toBe(
      DEPENDENT_NEST_ALIGN_INLINE_CHECKBOX_CLASS,
    )
  })

  it('classifies stacked selects as field-edge', () => {
    expect(
      resolveControllerDependentAnatomy({
        type: 'select',
        name: 'mode',
        label: 'Mode',
        options: [{ label: 'A', value: 'a' }],
      }),
    ).toBe('field-edge')
    expect(resolveDependentNestAlignmentClass('field-edge')).toBe(
      DEPENDENT_NEST_ALIGN_FIELD_EDGE_CLASS,
    )
  })

  it('classifies settings select as field-edge', () => {
    expect(
      resolveControllerDependentAnatomy({
        type: 'select',
        name: 'mode',
        label: 'Mode',
        labelPosition: 'settings',
        options: [{ label: 'A', value: 'a' }],
      }),
    ).toBe('field-edge')
  })

  it('classifies radio and segmented control as field-edge', () => {
    expect(
      resolveControllerDependentAnatomy({
        type: 'radio',
        name: 'r',
        label: 'R',
        options: [{ label: 'A', value: 'a' }],
      }),
    ).toBe('field-edge')
    expect(
      resolveControllerDependentAnatomy({
        type: 'segmentedControl',
        name: 's',
        label: 'S',
        options: [{ label: 'A', value: 'a' }],
      }),
    ).toBe('field-edge')
  })
})
