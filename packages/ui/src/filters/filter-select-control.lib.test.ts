import { describe, expect, it } from 'vitest'

import {
  UI_FIELD_CONTROL_TRIGGER_FILL_CLASS,
  UI_FIELD_CONTROL_TRIGGER_FIT_CLASS,
} from '../components/ui/field-control.styles'
import { resolveFilterSelectTriggerClassName } from './filter-select-control.lib'

describe('resolveFilterSelectTriggerClassName', () => {
  it('uses fit flow for inline and floating layouts', () => {
    expect(resolveFilterSelectTriggerClassName('inline')).toBe(UI_FIELD_CONTROL_TRIGGER_FIT_CLASS)
    expect(resolveFilterSelectTriggerClassName('floating')).toBe(UI_FIELD_CONTROL_TRIGGER_FIT_CLASS)
  })

  it('uses fill flow for stacked and default layouts', () => {
    expect(resolveFilterSelectTriggerClassName('stacked')).toBe(UI_FIELD_CONTROL_TRIGGER_FILL_CLASS)
    expect(resolveFilterSelectTriggerClassName('default')).toBe(UI_FIELD_CONTROL_TRIGGER_FILL_CLASS)
  })
})
