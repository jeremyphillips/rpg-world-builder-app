import type { ReactNode } from 'react'
import type { FormItem } from '@rpg/ui/form'
import { z } from 'zod'

import type { CharacterRelationshipFieldContext } from './character-relationship-field-context.types'
import { buildRelationshipArrayField } from './character-relationship-array-form-fields'
import {
  organizationMembershipFormRowSchema,
  organizationMembershipProjectionsToFormValues,
  type OrganizationMembershipSheetRow,
} from './character-relationship-form-rows.lib'
import type { CharacterRelationshipProjectionRow } from '@rpg/contracts'
import { CHARACTER_ORGANIZATION_MEMBERSHIP_VOCABULARY } from './character-relationship-vocabulary'

export const organizationMembershipsFormSchema = z.object({
  organizations: z.array(organizationMembershipFormRowSchema),
})

export type OrganizationMembershipsFormValues = z.infer<typeof organizationMembershipsFormSchema>

export function organizationMembershipsToFormValues(
  memberships:
    | readonly CharacterRelationshipProjectionRow[]
    | readonly OrganizationMembershipSheetRow[],
): OrganizationMembershipsFormValues {
  if (memberships.length === 0) {
    return { organizations: [] }
  }

  const first = memberships[0]
  if (first && 'relationshipId' in first && 'organizationId' in first && !('kind' in first)) {
    return {
      organizations: (memberships as readonly OrganizationMembershipSheetRow[]).map(
        ({ relationshipId, revision, organizationId, title, priority }) => ({
          relationshipId,
          revision,
          organizationId,
          ...(title !== undefined ? { title } : {}),
          ...(priority !== undefined ? { priority } : {}),
        }),
      ),
    }
  }

  return organizationMembershipProjectionsToFormValues(
    memberships as readonly CharacterRelationshipProjectionRow[],
  )
}

export type BuildOrganizationMembershipsFormFieldsInput = {
  relationshipContext: CharacterRelationshipFieldContext
  disabled?: boolean
  renderApiSync: () => ReactNode
}

export function buildOrganizationMembershipsFormFields({
  relationshipContext,
  disabled,
  renderApiSync,
}: BuildOrganizationMembershipsFormFieldsInput): FormItem[] {
  return [
    buildRelationshipArrayField({
      vocabulary: CHARACTER_ORGANIZATION_MEMBERSHIP_VOCABULARY,
      context: relationshipContext,
      disabled,
    }),
    {
      kind: 'slot',
      name: '_organizationMembershipsApiSync',
      chrome: { variant: 'none' },
      render: renderApiSync,
    },
  ]
}
