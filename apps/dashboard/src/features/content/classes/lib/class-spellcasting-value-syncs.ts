import type { FormValueSync } from '@rpg/ui/form'

import type { ClassFormValues } from './class-form-fields'
import {
  findSpellcastingGrantingFeatureIndex,
  reconcileSpellcastingOnEnable,
  removeSpellcastingFromFormValues,
} from './class-spellcasting-lifecycle'

export function buildClassSpellcastingValueSyncs(): FormValueSync[] {
  return [
    {
      dependsOn: ['hasSpellcasting'],
      apply: (values, changedKeys) => {
        if (!changedKeys.includes('hasSpellcasting')) return undefined
        const formValues = values as ClassFormValues
        if (formValues.hasSpellcasting) {
          return reconcileSpellcastingOnEnable(formValues)
        }
        return removeSpellcastingFromFormValues(formValues)
      },
    },
    {
      dependsOn: ['features'],
      apply: (values, changedKeys) => {
        if (!changedKeys.includes('features')) return undefined
        const formValues = values as ClassFormValues
        if (!formValues.hasSpellcasting) return undefined
        if (findSpellcastingGrantingFeatureIndex(formValues.features) !== -1) return undefined
        return { hasSpellcasting: false, spellcasting: undefined }
      },
    },
  ]
}
