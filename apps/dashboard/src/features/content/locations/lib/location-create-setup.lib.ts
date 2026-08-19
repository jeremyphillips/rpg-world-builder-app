import type { CreateSetupSet } from '@/lib/create-setup'

import type { LocationCreateModalSetupChoiceSetConfig } from './location-create-modal-setup.lib'

export function buildLocationCreateSetupSets(
  choiceSets: readonly LocationCreateModalSetupChoiceSetConfig[],
): CreateSetupSet[] {
  return choiceSets.map((choiceSet) => ({
    kind: 'choice',
    id: choiceSet.id,
    fieldLabel: choiceSet.fieldLabel,
    prompt: choiceSet.prompt,
    options: choiceSet.options,
    value: choiceSet.value,
    required: choiceSet.required,
    dependsOn: choiceSet.dependsOn,
    visibleWhenComplete: choiceSet.visibleWhenComplete,
    summaryGroup: choiceSet.summaryGroup,
    summaryGroupEyebrow: choiceSet.summaryGroupEyebrow,
    skipLabel: choiceSet.skipLabel,
    skipped: choiceSet.skipped,
    skippedValueLabel: choiceSet.skippedValueLabel,
    isComplete: choiceSet.isComplete,
  }))
}

export type LocationCreateSetupChoiceSet = LocationCreateModalSetupChoiceSetConfig
