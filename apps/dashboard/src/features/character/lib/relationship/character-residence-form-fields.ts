import {
  characterLocationConnectionsSchema,
  type CharacterLocationReferenceResolution,
} from '@rpg/contracts'
import type { ReactNode } from 'react'
import type { FormItem } from '@rpg/ui/form'
import { z } from 'zod'

import type { CharacterRelationshipFieldContext } from './character-relationship-field-context.types'
import { buildRelationshipArrayField } from './character-relationship-array-form-fields'
import { CHARACTER_RESIDENCE_VOCABULARY } from './character-relationship-vocabulary'

export const residenceFormSchema = z.object({
  locations: characterLocationConnectionsSchema,
})

export type ResidenceFormValues = z.infer<typeof residenceFormSchema>

export function residencesToFormValues(
  residences: readonly CharacterLocationReferenceResolution[],
): ResidenceFormValues {
  return {
    locations: residences.map(({ connection }) => connection),
  }
}

export function areResidenceListsEqual(
  left: readonly CharacterLocationReferenceResolution[],
  right: readonly CharacterLocationReferenceResolution[],
): boolean {
  return (
    JSON.stringify(residencesToFormValues(left).locations) ===
    JSON.stringify(residencesToFormValues(right).locations)
  )
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
