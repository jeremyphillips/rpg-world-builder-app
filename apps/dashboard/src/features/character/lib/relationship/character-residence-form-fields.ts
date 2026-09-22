import type { CharacterRelationshipProjectionRow } from '@rpg/contracts'
import type { ReactNode } from 'react'
import type { FormItem } from '@rpg/ui/form'
import { z } from 'zod'

import type { CharacterRelationshipFieldContext } from './character-relationship-field-context.types'
import { buildRelationshipArrayField } from './character-relationship-array-form-fields'
import {
  residenceFormRowSchema,
  residenceProjectionsToFormValues,
} from './character-relationship-form-rows.lib'
import { CHARACTER_RESIDENCE_VOCABULARY } from './character-relationship-vocabulary'

export const residenceFormSchema = z.object({
  locations: z.array(residenceFormRowSchema),
})

export type ResidenceFormValues = z.infer<typeof residenceFormSchema>

export function residencesToFormValues(
  residences: readonly CharacterRelationshipProjectionRow[],
): ResidenceFormValues {
  return residenceProjectionsToFormValues(residences)
}

export type BuildResidenceFormFieldsInput = {
  relationshipContext: CharacterRelationshipFieldContext
  disabled?: boolean
  renderApiSync: () => ReactNode
}

export function buildResidenceFormFields({
  relationshipContext,
  disabled,
  renderApiSync,
}: BuildResidenceFormFieldsInput): FormItem[] {
  return [
    buildRelationshipArrayField({
      vocabulary: CHARACTER_RESIDENCE_VOCABULARY,
      context: relationshipContext,
      disabled,
    }),
    {
      kind: 'slot',
      name: '_characterResidenceApiSync',
      chrome: { variant: 'none' },
      render: renderApiSync,
    },
  ]
}
