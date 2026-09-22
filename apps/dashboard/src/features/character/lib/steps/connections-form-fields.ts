import { characterConnectionsSchema } from '@rpg/contracts'
import type { ReactNode } from 'react'
import type { FormItem } from '@rpg/ui/form'
import type { z } from 'zod'

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
  renderDraftSync: () => ReactNode
}

export function buildConnectionsStepFormFields({
  renderDraftSync,
}: BuildConnectionsStepFormFieldsInput): FormItem[] {
  return [
    {
      kind: 'group',
      fieldChrome: { variant: 'none' },
      fields: [
        {
          type: 'relationship',
          name: 'organizations',
          label: 'Organizations',
          vocabulary: CHARACTER_ORGANIZATION_MEMBERSHIP_VOCABULARY,
          emptyLabel: 'No organizations connected yet.',
          addActionLabel: 'Add organization',
        },
        {
          type: 'relationship',
          name: 'locations',
          label: 'Residence',
          vocabulary: CHARACTER_RESIDENCE_VOCABULARY,
          emptyLabel: 'No residence connected yet.',
          addActionLabel: 'Add residence',
        },
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
