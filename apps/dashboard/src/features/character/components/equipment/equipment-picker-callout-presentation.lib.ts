import type { BadgeAppearance, BadgeSize, BadgeTone } from '@rpg/ui'

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
  type EquipmentPickerCallout,
} from './equipment-picker-drawer.types'

export type EquipmentCalloutLeadingIcon = 'check' | 'warning'

export type EquipmentCalloutPresentation = {
  appearance: BadgeAppearance
  tone: BadgeTone
  size: BadgeSize
  leadingIcon?: EquipmentCalloutLeadingIcon
}

const EQUIPMENT_CALLOUT_AUTHORED_LABEL_PRESENTATION = {
  appearance: 'outline',
  tone: 'info',
  size: 'sm',
} as const satisfies EquipmentCalloutPresentation

const EQUIPMENT_CALLOUT_LABEL_PRESENTATION = {
  [EQUIPMENT_PICKER_STANDARD_GEAR_LABEL]: {
    appearance: 'outline',
    tone: 'info',
    size: 'sm',
  },
  [EQUIPMENT_PICKER_PROFICIENCY_AVAILABLE_LABEL]: {
    appearance: 'outline',
    tone: 'info',
    size: 'sm',
  },
  [EQUIPMENT_PICKER_COMMON_FOR_CLASS_LABEL]: {
    appearance: 'outline',
    tone: 'info',
    size: 'sm',
  },
  [EQUIPMENT_PICKER_STARTING_OPTION_LABEL]: {
    appearance: 'accent-outline',
    tone: 'info',
    size: 'sm',
  },
  [EQUIPMENT_PICKER_SPELLCASTING_FOCUS_LABEL]: {
    appearance: 'accent-outline',
    tone: 'info',
    size: 'sm',
  },
  [EQUIPMENT_PICKER_ESSENTIAL_LABEL]: {
    appearance: 'soft',
    tone: 'info',
    size: 'sm',
  },
  [EQUIPMENT_PICKER_CLASS_TOOL_LABEL]: {
    appearance: 'soft',
    tone: 'info',
    size: 'sm',
  },
  [EQUIPMENT_PICKER_PROFICIENT_LABEL]: {
    appearance: 'soft',
    tone: 'success',
    size: 'sm',
    leadingIcon: 'check',
  },
  [EQUIPMENT_PICKER_NOT_PROFICIENT_LABEL]: {
    appearance: 'soft',
    tone: 'warning',
    size: 'sm',
    leadingIcon: 'warning',
  },
  [EQUIPMENT_PICKER_CANNOT_AFFORD_LABEL]: {
    appearance: 'soft',
    tone: 'destructive',
    size: 'sm',
    leadingIcon: 'warning',
  },
} as const satisfies Record<string, EquipmentCalloutPresentation>

export function getEquipmentCalloutPresentation(
  callout: EquipmentPickerCallout,
): EquipmentCalloutPresentation {
  return (
    EQUIPMENT_CALLOUT_LABEL_PRESENTATION[
      callout.label as keyof typeof EQUIPMENT_CALLOUT_LABEL_PRESENTATION
    ] ?? EQUIPMENT_CALLOUT_AUTHORED_LABEL_PRESENTATION
  )
}
