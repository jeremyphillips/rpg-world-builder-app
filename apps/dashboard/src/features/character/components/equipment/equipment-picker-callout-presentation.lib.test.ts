import { describe, expect, it } from 'vitest'

import {
  EQUIPMENT_PICKER_CANNOT_AFFORD_LABEL,
  EQUIPMENT_PICKER_CLASS_TOOL_LABEL,
  EQUIPMENT_PICKER_COMMON_FOR_CLASS_LABEL,
  EQUIPMENT_PICKER_ESSENTIAL_LABEL,
  EQUIPMENT_PICKER_NOT_PROFICIENT_LABEL,
  EQUIPMENT_PICKER_PROFICIENCY_AVAILABLE_LABEL,
  EQUIPMENT_PICKER_PROFICIENT_LABEL,
  EQUIPMENT_PICKER_SPELLCASTING_FOCUS_LABEL,
  EQUIPMENT_PICKER_STANDARD_GEAR_LABEL,
  EQUIPMENT_PICKER_STARTING_OPTION_LABEL,
} from './equipment-picker-drawer.types'
import { getEquipmentCalloutPresentation } from './equipment-picker-callout-presentation.lib'

describe('equipment-picker-callout-presentation.lib', () => {
  function presentationFor(label: string) {
    return getEquipmentCalloutPresentation({
      label,
      intent: 'info',
      importance: 'medium',
    })
  }

  it('maps low-emphasis informative labels to outline informative badges', () => {
    expect(presentationFor(EQUIPMENT_PICKER_STANDARD_GEAR_LABEL)).toEqual({
      appearance: 'outline',
      tone: 'info',
    })
    expect(presentationFor(EQUIPMENT_PICKER_PROFICIENCY_AVAILABLE_LABEL)).toEqual({
      appearance: 'outline',
      tone: 'info',
    })
    expect(presentationFor(EQUIPMENT_PICKER_COMMON_FOR_CLASS_LABEL)).toEqual({
      appearance: 'outline',
      tone: 'info',
    })
  })

  it('maps recommended-source labels to accent-outline informative badges', () => {
    expect(presentationFor(EQUIPMENT_PICKER_STARTING_OPTION_LABEL)).toEqual({
      appearance: 'accent-outline',
      tone: 'info',
    })
    expect(presentationFor(EQUIPMENT_PICKER_SPELLCASTING_FOCUS_LABEL)).toEqual({
      appearance: 'accent-outline',
      tone: 'info',
    })
  })

  it('maps essential blockers to soft informative badges', () => {
    expect(presentationFor(EQUIPMENT_PICKER_ESSENTIAL_LABEL)).toEqual({
      appearance: 'soft',
      tone: 'info',
    })
    expect(presentationFor(EQUIPMENT_PICKER_CLASS_TOOL_LABEL)).toEqual({
      appearance: 'soft',
      tone: 'info',
    })
  })

  it('maps proficiency-state labels to soft badges with icons', () => {
    expect(presentationFor(EQUIPMENT_PICKER_PROFICIENT_LABEL)).toEqual({
      appearance: 'soft',
      tone: 'success',
      leadingIcon: 'check',
    })
    expect(presentationFor(EQUIPMENT_PICKER_NOT_PROFICIENT_LABEL)).toEqual({
      appearance: 'soft',
      tone: 'warning',
      leadingIcon: 'warning',
    })
  })

  it('maps cannot afford to soft negative with warning icon', () => {
    expect(presentationFor(EQUIPMENT_PICKER_CANNOT_AFFORD_LABEL)).toEqual({
      appearance: 'soft',
      tone: 'destructive',
      leadingIcon: 'warning',
    })
  })

  it('falls back authored recommendation labels to outline informative badges', () => {
    expect(presentationFor('Alternative option')).toEqual({
      appearance: 'outline',
      tone: 'info',
    })
  })
})
