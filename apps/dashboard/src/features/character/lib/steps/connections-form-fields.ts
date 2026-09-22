import { characterConnectionsSchema } from '@rpg/contracts'
import type { ReactNode } from 'react'
import type { FormItem } from '@rpg/ui/form'
import type { z } from 'zod'

import type { CharacterRelationshipFieldContext } from '../relationship/character-relationship-field-context.types'
import { buildRelationshipArrayField } from '../relationship/character-relationship-array-form-fields'
import {
  CHARACTER_ORGANIZATION_MEMBERSHIP_VOCABULARY,
  CHARACTER_RESIDENCE_VOCABULARY,
} from '../relationship/character-relationship-vocabulary'

export const connectionsFormSchema = characterConnectionsSchema.pick({
  organizations: true,
  locations: true,
})

export type ConnectionsFormValues = z.infer<typeof connectionsFormSchema>

export type BuildConnectionsStepFormFieldsInput = {
  relationshipContext: CharacterRelationshipFieldContext
  renderDraftSync: () => ReactNode
}

export function buildConnectionsStepFormFields({
  relationshipContext,
  renderDraftSync,
}: BuildConnectionsStepFormFieldsInput): FormItem[] {
  return [
    {
      kind: 'group',
      fieldChrome: { variant: 'none' },
      fields: [
        buildRelationshipArrayField({
          vocabulary: CHARACTER_ORGANIZATION_MEMBERSHIP_VOCABULARY,
          context: relationshipContext,
        }),
        buildRelationshipArrayField({
          vocabulary: CHARACTER_RESIDENCE_VOCABULARY,
          context: relationshipContext,
        }),
      ],
    },
    {
      kind: 'slot',
      name: '_connectionsDraftSync',
      chrome: { variant: 'none' },
      render: renderDraftSync,
    },
  ]
}
