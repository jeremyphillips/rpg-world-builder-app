import type { SemanticTextEmphasis, SemanticTextTone } from '@rpg/ui'

import type { EquipmentPickerCallout } from './equipment-picker-drawer.types'

export type EquipmentCalloutPresentation = {
  tone: SemanticTextTone
  emphasis: SemanticTextEmphasis
  icon: 'none' | 'warning'
}

export function getEquipmentCalloutPresentation(
  callout: EquipmentPickerCallout,
): EquipmentCalloutPresentation {
  const tone = getCalloutTone(callout.intent)
  const icon = callout.intent === 'caution' || callout.intent === 'blocking' ? 'warning' : 'none'

  return {
    tone,
    emphasis: callout.importance,
    icon,
  }
}

function getCalloutTone(intent: EquipmentPickerCallout['intent']): SemanticTextTone {
  switch (intent) {
    case 'informative':
    case 'recommended':
      return 'informative'
    case 'compatible':
      return 'positive'
    case 'caution':
      return 'caution'
    case 'blocking':
      return 'negative'
  }
}
