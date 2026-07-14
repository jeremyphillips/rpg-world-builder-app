import {
  getSpellApplicationPatternKindLabel,
  getSpellResolutionAttackTypeLabel,
  getSpellResolutionOutcomeAuthoringLabel,
  getSpellResolutionProximityKindLabel,
  type ResolutionChangePlan,
  type ResolutionChangeRequest,
  type ResolutionMethodOption,
} from '@rpg/contracts'

import { describeEffectForConfirm } from './resolution-selection-options.lib'

function methodOptionLabel(option: ResolutionMethodOption): string {
  if (option === 'saving-throw') return 'Saving throw'
  if (option === 'automatic') return 'Automatic'
  return getSpellResolutionAttackTypeLabel(option)
}

function formatIncompatibleSelectionLine(
  selection: ResolutionChangePlan['incompatibleSelections'][number],
): string {
  if (selection.field === 'method') {
    return `invalidate the current ${methodOptionLabel(selection.currentOption)} selection`
  }
  return `remove the ${getSpellApplicationPatternKindLabel(selection.currentKind)} application pattern`
}

const CHANGE_FIELD_HEADLINES: Record<ResolutionChangeRequest['field'], string> = {
  proximityKind: 'Change target proximity?',
  methodOption: 'Change resolution method?',
  applicationPatternKind: 'Change application pattern?',
  removeEffect: 'Remove effect?',
}

export type ResolutionChangeDialogCopy = {
  headline: string
  intro: string
  consequences: string[]
  footer: string
}

/** Aggregates all plan consequences for the confirm dialog body. */
export function formatChangePlanForDialog(
  plan: ResolutionChangePlan,
  change: ResolutionChangeRequest,
): ResolutionChangeDialogCopy {
  const headline = CHANGE_FIELD_HEADLINES[change.field]

  const consequences = [
    ...plan.incompatibleSelections.map((selection) => formatIncompatibleSelectionLine(selection)),
    ...plan.effectsToRemove.map((effect) => `remove ${describeEffectForConfirm(effect)}`),
    ...plan.discardedOutcomeBranches.map(
      (result) => `discard authored content for ${getSpellResolutionOutcomeAuthoringLabel(result)}`,
    ),
  ]

  let intro = 'Applying this change will:'
  if (change.field === 'proximityKind') {
    intro = `Changing the target to ${getSpellResolutionProximityKindLabel(change.value)} will:`
  }

  return {
    headline,
    intro,
    consequences,
    footer: 'Review the Resolution fields after applying this change.',
  }
}
