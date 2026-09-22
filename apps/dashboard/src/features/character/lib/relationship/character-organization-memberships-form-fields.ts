import { characterConnectionsSchema } from '@rpg/contracts'
import type { OrganizationReferenceResolution } from '@rpg/contracts'
import type { ReactNode } from 'react'
import type { FormItem } from '@rpg/ui/form'
import type { z } from 'zod'

import type { CharacterRelationshipFieldContext } from './character-relationship-field-context.types'
import { buildRelationshipArrayField } from './character-relationship-array-form-fields'
import { CHARACTER_ORGANIZATION_MEMBERSHIP_VOCABULARY } from './character-relationship-vocabulary'

export const organizationMembershipsFormSchema = characterConnectionsSchema.pick({
  organizations: true,
})

export type OrganizationMembershipsFormValues = z.infer<typeof organizationMembershipsFormSchema>

export function organizationMembershipsToFormValues(
  memberships: readonly OrganizationReferenceResolution[],
): OrganizationMembershipsFormValues {
  return {
    organizations: memberships.map(({ organizationId, title, priority }) => ({
      organizationId,
      ...(title !== undefined ? { title } : {}),
      ...(priority !== undefined ? { priority } : {}),
    })),
  }
}

export function areOrganizationMembershipListsEqual(
  left: readonly OrganizationReferenceResolution[],
  right: readonly OrganizationReferenceResolution[],
): boolean {
  return (
    JSON.stringify(organizationMembershipsToFormValues(left).organizations) ===
    JSON.stringify(organizationMembershipsToFormValues(right).organizations)
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
