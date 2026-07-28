import {
  type CharacterBuilderDraft,
  type CharacterClass,
  type EquipmentStepModel,
  type EquipmentStepUnavailableReason,
  type ResolvedStartingEquipmentFunding,
  type StartingEquipmentOptionSummary,
} from '@rpg/contracts'

import {
  hasGoldStartingEquipmentOption,
  shouldShowEquipmentBudget,
  shouldShowEquipmentFallback,
  shouldShowEquipmentShopping,
} from './equipment-step.lib'

export type EquipmentStepSurface = {
  classOptionPolicy: ResolvedStartingEquipmentFunding['classOptionPolicy']
  classOptionsReplaced: boolean
  tierLabel?: string
  showFallback: boolean
  showBudget: boolean
  showShopping: boolean
}

export type ResolveEquipmentStepSurfaceResult =
  | { status: 'available'; surface: EquipmentStepSurface }
  | { status: 'unavailable'; reason: EquipmentStepUnavailableReason }

export function resolveEquipmentStepUnavailableReason(args: {
  classId: string | undefined
  characterClass: CharacterClass | undefined
  stepModel: EquipmentStepModel | undefined
  selectedOptionId: string | undefined
}): EquipmentStepUnavailableReason | undefined {
  if (!args.classId) return 'class_missing'
  if (!args.characterClass) return 'class_not_in_catalog'
  if (!args.stepModel) return 'funding_context_missing'
  if (args.selectedOptionId && !args.stepModel.currentFunding) return 'funding_context_missing'
  return undefined
}

export function resolveEquipmentStepSurface(args: {
  draft: CharacterBuilderDraft
  characterClass: CharacterClass | undefined
  classId: string | undefined
  stepModel: EquipmentStepModel | undefined
  summaries: readonly StartingEquipmentOptionSummary[]
  selectedOptionId: string | undefined
}): ResolveEquipmentStepSurfaceResult {
  const unavailableReason = resolveEquipmentStepUnavailableReason(args)
  if (unavailableReason) {
    return { status: 'unavailable', reason: unavailableReason }
  }

  const { draft, characterClass, stepModel, summaries, selectedOptionId } = args
  const classOptionPolicy = stepModel!.currentFunding?.classOptionPolicy ?? 'included'
  const classOptionsReplaced = classOptionPolicy === 'replaced'

  return {
    status: 'available',
    surface: {
      classOptionPolicy,
      classOptionsReplaced,
      tierLabel: stepModel!.currentFunding?.tierLabel,
      showFallback:
        !classOptionsReplaced &&
        shouldShowEquipmentFallback(summaries) &&
        !hasGoldStartingEquipmentOption(summaries),
      showBudget: shouldShowEquipmentBudget(draft, selectedOptionId),
      showShopping:
        !classOptionsReplaced &&
        shouldShowEquipmentShopping(draft, selectedOptionId, characterClass),
    },
  }
}
