import { isCreateSetupChoiceComplete, type CreateSetupSet } from '@/lib/create-setup'

import type { LocationCreateModalSetupChoiceSetConfig } from './location-create-modal-setup.lib'

export type LocationCreateSetupChoiceSet = LocationCreateModalSetupChoiceSetConfig & {
  onValueChange: (value: string) => void
}

export function buildLocationCreateSetupSets(
  choiceSets: readonly LocationCreateSetupChoiceSet[],
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
    isComplete: isCreateSetupChoiceComplete(choiceSet.value),
    onValueChange: choiceSet.onValueChange,
    onReset: () => choiceSet.onValueChange(''),
  }))
}
