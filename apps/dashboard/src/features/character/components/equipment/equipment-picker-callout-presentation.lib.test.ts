import { describe, expect, it } from 'vitest'

import type { EquipmentPickerCallout } from './equipment-picker-drawer.types'
import { getEquipmentCalloutPresentation } from './equipment-picker-callout-presentation.lib'

describe('equipment-picker-callout-presentation.lib', () => {
  function presentationFor(
    intent: EquipmentPickerCallout['intent'],
    importance: EquipmentPickerCallout['importance'] = 'medium',
  ) {
    return getEquipmentCalloutPresentation({ label: 'Test', intent, importance })
  }

  it('maps informative and recommended intents to informative tone without icon', () => {
    expect(presentationFor('informative')).toEqual({
      tone: 'informative',
      emphasis: 'medium',
      icon: 'none',
    })
    expect(presentationFor('recommended', 'high')).toEqual({
      tone: 'informative',
      emphasis: 'high',
      icon: 'none',
    })
  })

  it('maps compatible intent to positive tone without icon', () => {
    expect(presentationFor('compatible')).toEqual({
      tone: 'positive',
      emphasis: 'medium',
      icon: 'none',
    })
  })

  it('maps caution intent to caution tone with warning icon', () => {
    expect(presentationFor('caution')).toEqual({
      tone: 'caution',
      emphasis: 'medium',
      icon: 'warning',
    })
  })

  it('maps blocking intent to negative tone with warning icon', () => {
    expect(presentationFor('blocking', 'high')).toEqual({
      tone: 'negative',
      emphasis: 'high',
      icon: 'warning',
    })
  })
})
