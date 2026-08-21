import type { BadgeAppearance, BadgeTone } from '@rpg/ui'

import type { EntitySummaryStatusItem } from '@/features/content'

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
} from '../drawer/equipment-picker-drawer.types'

export type EquipmentCalloutLeadingIcon = 'check' | 'warning'

export type EquipmentCalloutPresentation = {
  appearance: BadgeAppearance
  tone: BadgeTone
  leadingIcon?: EquipmentCalloutLeadingIcon
}

const EQUIPMENT_CALLOUT_AUTHORED_LABEL_PRESENTATION = {
  appearance: 'outline',
  tone: 'info',
} as const satisfies EquipmentCalloutPresentation

const EQUIPMENT_CALLOUT_LABEL_PRESENTATION = {
  [EQUIPMENT_PICKER_STANDARD_GEAR_LABEL]: {
    appearance: 'outline',
    tone: 'info',
  },
  [EQUIPMENT_PICKER_PROFICIENCY_AVAILABLE_LABEL]: {
    appearance: 'outline',
    tone: 'info',
  },
  [EQUIPMENT_PICKER_COMMON_FOR_CLASS_LABEL]: {
    appearance: 'outline',
    tone: 'info',
  },
  [EQUIPMENT_PICKER_STARTING_OPTION_LABEL]: {
    appearance: 'outline',
    tone: 'info',
  },
  [EQUIPMENT_PICKER_SPELLCASTING_FOCUS_LABEL]: {
    appearance: 'soft',
    tone: 'info',
  },
  [EQUIPMENT_PICKER_ESSENTIAL_LABEL]: {
    appearance: 'strong',
    tone: 'info',
  },
  [EQUIPMENT_PICKER_CLASS_TOOL_LABEL]: {
    appearance: 'strong',
    tone: 'info',
  },
  [EQUIPMENT_PICKER_PROFICIENT_LABEL]: {
    appearance: 'soft',
    tone: 'success',
    leadingIcon: 'check',
  },
  [EQUIPMENT_PICKER_NOT_PROFICIENT_LABEL]: {
    appearance: 'soft',
    tone: 'warning',
    leadingIcon: 'warning',
  },
  [EQUIPMENT_PICKER_CANNOT_AFFORD_LABEL]: {
    appearance: 'soft',
    tone: 'destructive',
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

export function mapEquipmentCalloutToStatusItem(
  callout: EquipmentPickerCallout,
): EntitySummaryStatusItem {
  const presentation = getEquipmentCalloutPresentation(callout)

  return {
    kind: 'badge',
    label: callout.label,
    appearance: presentation.appearance,
    tone: presentation.tone,
    leadingIcon: presentation.leadingIcon,
  }
}

function buildEquipmentPickerStatus(
  callout: EquipmentPickerCallout | undefined,
  statusItems: readonly EntitySummaryStatusItem[] | undefined,
): readonly EntitySummaryStatusItem[] | undefined {
  const items = [
    ...(callout ? [mapEquipmentCalloutToStatusItem(callout)] : []),
    ...(statusItems ?? []),
  ]

  return items.length > 0 ? items : undefined
}

export function buildEquipmentPickerEntityStatus(args: {
  callout: EquipmentPickerCallout | undefined
  statusItems?: readonly EntitySummaryStatusItem[]
}): readonly EntitySummaryStatusItem[] | undefined {
  return buildEquipmentPickerStatus(args.callout, args.statusItems)
}
