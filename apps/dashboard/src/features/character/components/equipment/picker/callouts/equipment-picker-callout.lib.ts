import type { EquipmentPickerItem } from '../drawer/equipment-picker-drawer.types'
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
  type EquipmentPickerCalloutContext,
  type EquipmentPickerCalloutSemanticStatus,
} from '../drawer/equipment-picker-drawer.types'

const EQUIPMENT_CALLOUT_SOURCE_PRIORITY = {
  disabledReason: 500,
  affordability: 400,
  essentialRecommendation: 300,
  compatibility: 200,
  generalRecommendation: 100,
  proficiencyCaution: 50,
} as const

export type EquipmentCalloutCandidate = {
  priority: (typeof EQUIPMENT_CALLOUT_SOURCE_PRIORITY)[keyof typeof EQUIPMENT_CALLOUT_SOURCE_PRIORITY]
  callout: EquipmentPickerCallout
}

export function selectHighestPriorityCallout(
  candidates: readonly EquipmentCalloutCandidate[],
): EquipmentPickerCallout | undefined {
  return candidates.reduce<EquipmentCalloutCandidate | undefined>(
    (selected, candidate) =>
      !selected || candidate.priority > selected.priority ? candidate : selected,
    undefined,
  )?.callout
}

function getKnownBlockingCandidate(
  disabledReasons: readonly string[],
): EquipmentCalloutCandidate | undefined {
  // TODO(equipment-callout): normalize first supported equipment disabledReason
  void disabledReasons
  return undefined
}

function getAffordabilityCandidate(
  item: EquipmentPickerItem,
): EquipmentCalloutCandidate | undefined {
  if (item.state.purchaseAvailability.status !== 'unaffordable') return undefined

  return {
    priority: EQUIPMENT_CALLOUT_SOURCE_PRIORITY.affordability,
    callout: {
      label: EQUIPMENT_PICKER_CANNOT_AFFORD_LABEL,
      intent: 'blocking',
      importance: 'high',
    },
  }
}

function getEssentialRecommendationCandidate(
  item: EquipmentPickerItem,
): EquipmentCalloutCandidate | undefined {
  const { tier, reasons } = item.state.recommendation
  if (tier !== 'essential') return undefined

  if (reasons.includes('spellcastingFocus')) {
    return {
      priority: EQUIPMENT_CALLOUT_SOURCE_PRIORITY.essentialRecommendation,
      callout: {
        label: EQUIPMENT_PICKER_SPELLCASTING_FOCUS_LABEL,
        intent: 'recommended',
        importance: 'medium',
      },
    }
  }

  if (reasons.includes('classToolNeed')) {
    return {
      priority: EQUIPMENT_CALLOUT_SOURCE_PRIORITY.essentialRecommendation,
      callout: {
        label: EQUIPMENT_PICKER_CLASS_TOOL_LABEL,
        intent: 'recommended',
        importance: 'high',
      },
    }
  }

  return {
    priority: EQUIPMENT_CALLOUT_SOURCE_PRIORITY.essentialRecommendation,
    callout: {
      label: EQUIPMENT_PICKER_ESSENTIAL_LABEL,
      intent: 'recommended',
      importance: 'high',
    },
  }
}

function getCompatibilityCandidate(
  item: EquipmentPickerItem,
): EquipmentCalloutCandidate | undefined {
  const { reasons } = item.state.recommendation

  if (reasons.includes('selectedToolProficiency')) {
    return {
      priority: EQUIPMENT_CALLOUT_SOURCE_PRIORITY.compatibility,
      callout: {
        label: EQUIPMENT_PICKER_PROFICIENT_LABEL,
        intent: 'compatible',
        importance: 'medium',
      },
    }
  }

  return undefined
}

function getGeneralRecommendationCandidate(
  item: EquipmentPickerItem,
  context: EquipmentPickerCalloutContext,
): EquipmentCalloutCandidate | undefined {
  const { tier, reasons, label } = item.state.recommendation
  const isGoldShoppingPath = context.isGoldShoppingPath ?? false

  if (reasons.includes('unresolvedToolProficiencyChoice')) {
    return {
      priority: EQUIPMENT_CALLOUT_SOURCE_PRIORITY.generalRecommendation,
      callout: {
        label: EQUIPMENT_PICKER_PROFICIENCY_AVAILABLE_LABEL,
        intent: 'info',
        importance: 'low',
      },
    }
  }

  if (reasons.includes('classToolCategory')) {
    return {
      priority: EQUIPMENT_CALLOUT_SOURCE_PRIORITY.generalRecommendation,
      callout: {
        label: EQUIPMENT_PICKER_COMMON_FOR_CLASS_LABEL,
        intent: 'info',
        importance: 'low',
      },
    }
  }

  if (reasons.includes('startingEquipmentChoice')) {
    return {
      priority: EQUIPMENT_CALLOUT_SOURCE_PRIORITY.generalRecommendation,
      callout: {
        label: EQUIPMENT_PICKER_STARTING_OPTION_LABEL,
        intent: 'recommended',
        importance: 'medium',
      },
    }
  }

  if (reasons.includes('availableInStartingOption') && isGoldShoppingPath) {
    return {
      priority: EQUIPMENT_CALLOUT_SOURCE_PRIORITY.generalRecommendation,
      callout: {
        label: EQUIPMENT_PICKER_STANDARD_GEAR_LABEL,
        intent: 'info',
        importance: 'low',
      },
    }
  }

  if (tier === 'strong' && reasons.includes('startingEquipment')) {
    return {
      priority: EQUIPMENT_CALLOUT_SOURCE_PRIORITY.generalRecommendation,
      callout: {
        label: EQUIPMENT_PICKER_STARTING_OPTION_LABEL,
        intent: 'recommended',
        importance: 'medium',
      },
    }
  }

  if (label) {
    return {
      priority: EQUIPMENT_CALLOUT_SOURCE_PRIORITY.generalRecommendation,
      callout: {
        label,
        intent: 'info',
        importance: 'medium',
      },
    }
  }

  return undefined
}

function getProficiencyCautionCandidate(
  item: EquipmentPickerItem,
): EquipmentCalloutCandidate | undefined {
  if (item.state.isProficient) return undefined

  return {
    priority: EQUIPMENT_CALLOUT_SOURCE_PRIORITY.proficiencyCaution,
    callout: {
      label: EQUIPMENT_PICKER_NOT_PROFICIENT_LABEL,
      intent: 'warning',
      importance: 'medium',
    },
  }
}

function resolveCalloutSemanticStatus(
  candidate: EquipmentCalloutCandidate,
): EquipmentPickerCalloutSemanticStatus | undefined {
  switch (candidate.priority) {
    case EQUIPMENT_CALLOUT_SOURCE_PRIORITY.disabledReason:
    case EQUIPMENT_CALLOUT_SOURCE_PRIORITY.affordability:
      return 'blocking'
    case EQUIPMENT_CALLOUT_SOURCE_PRIORITY.essentialRecommendation:
      return 'essential'
    case EQUIPMENT_CALLOUT_SOURCE_PRIORITY.compatibility:
      return 'compatibility'
    case EQUIPMENT_CALLOUT_SOURCE_PRIORITY.generalRecommendation:
      return candidate.callout.label === EQUIPMENT_PICKER_STANDARD_GEAR_LABEL ? 'standard' : 'info'
    case EQUIPMENT_CALLOUT_SOURCE_PRIORITY.proficiencyCaution:
      return 'not_proficient'
    default:
      return undefined
  }
}

function filterCandidatesByVisibleStatuses(
  candidates: readonly EquipmentCalloutCandidate[],
  context: EquipmentPickerCalloutContext,
): EquipmentCalloutCandidate[] {
  const visibleStatuses = context.visibleStatuses
  if (!visibleStatuses || visibleStatuses.length === 0) return [...candidates]

  const allowed = new Set(visibleStatuses)
  return candidates.filter((candidate) => {
    const status = resolveCalloutSemanticStatus(candidate)
    return status !== undefined && allowed.has(status)
  })
}

function collectEquipmentCalloutCandidates(
  item: EquipmentPickerItem,
  context: EquipmentPickerCalloutContext,
): EquipmentCalloutCandidate[] {
  return [
    getKnownBlockingCandidate(item.state.disabledReasons),
    getAffordabilityCandidate(item),
    getEssentialRecommendationCandidate(item),
    getCompatibilityCandidate(item),
    getGeneralRecommendationCandidate(item, context),
    getProficiencyCautionCandidate(item),
  ].filter((candidate): candidate is EquipmentCalloutCandidate => candidate !== undefined)
}

/**
 * Single-callout policy: highest-priority source wins; equal priorities keep the
 * first candidate in collection order.
 */
export function getEquipmentPickerCallout(
  item: EquipmentPickerItem,
  context: EquipmentPickerCalloutContext = {},
): EquipmentPickerCallout | undefined {
  const candidates = filterCandidatesByVisibleStatuses(
    collectEquipmentCalloutCandidates(item, context),
    context,
  )
  return selectHighestPriorityCallout(candidates)
}
