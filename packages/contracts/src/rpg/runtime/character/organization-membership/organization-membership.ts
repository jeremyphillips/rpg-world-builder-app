import { z } from 'zod'

import type { OrganizationMembershipTitleDefinition } from '../../../content/organization/membership-titles'
import { characterOrganizationConnectionSchema } from '../connections/connections'
import { comparePriorityDescending } from '../../../vocab/types'

import {
  assertOrganizationMembershipTitleIdBelongsToCatalog,
  resolveOrganizationMembershipPriorityFromProjection,
  resolveOptionalOrganizationMembershipTitleProjection,
  type OrganizationMembershipTitleProjection,
} from './membership-title-projection'

/** Body for nested POST …/organization-memberships. */
export const createCharacterOrganizationMembershipInputSchema =
  characterOrganizationConnectionSchema

export type CreateCharacterOrganizationMembershipInput = z.infer<
  typeof createCharacterOrganizationMembershipInputSchema
>

/** Body for nested PATCH …/organization-memberships/:organizationId. */
export const updateCharacterOrganizationMembershipInputSchema = z.object({
  membershipTitleId: z.string().trim().min(1),
})

export type UpdateCharacterOrganizationMembershipInput = z.infer<
  typeof updateCharacterOrganizationMembershipInputSchema
>

type MembershipPrioritySource = {
  readonly membershipTitleId?: string
}

/**
 * Effective roster priority for a membership from the organization catalog projection.
 */
export function resolveOrganizationMembershipPriority(input: {
  membership: MembershipPrioritySource
  titles: readonly OrganizationMembershipTitleDefinition[]
}): number | undefined {
  const projection = resolveOptionalOrganizationMembershipTitleProjection({
    catalog: input.titles,
    membershipTitleId: input.membership.membershipTitleId,
  })
  return resolveOrganizationMembershipPriorityFromProjection(projection)
}

type SortableOrganizationMember = {
  readonly id: string
  readonly name: string
  readonly priority?: number
}

/**
 * Roster order: priority descending, unranked after ranked, then case-insensitive
 * locale name compare, then id as the final stable key.
 */
export function sortOrganizationMembers<T extends SortableOrganizationMember>(
  members: readonly T[],
): T[] {
  return [...members].sort((left, right) => {
    const leftRanked = left.priority !== undefined
    const rightRanked = right.priority !== undefined
    if (leftRanked && rightRanked) {
      const priorityCompare = comparePriorityDescending(
        { priority: left.priority! },
        { priority: right.priority! },
      )
      if (priorityCompare !== 0) return priorityCompare
    } else if (leftRanked !== rightRanked) {
      return leftRanked ? -1 : 1
    }

    const nameCompare = left.name.localeCompare(right.name, 'en', { sensitivity: 'base' })
    if (nameCompare !== 0) return nameCompare
    return left.id.localeCompare(right.id)
  })
}

export type ResolvedOrganizationMembershipMetadata = {
  readonly membershipTitleId: string
}

/** Maps picker selection to persisted membership title id. */
export function resolveOrganizationMembershipMetadata(input: {
  titles: readonly OrganizationMembershipTitleDefinition[]
  selectedMembershipTitleId: string
}): ResolvedOrganizationMembershipMetadata {
  const membershipTitleId = input.selectedMembershipTitleId.trim()
  if (membershipTitleId === '') {
    throw new Error('Organization membership title id is required.')
  }

  assertOrganizationMembershipTitleIdBelongsToCatalog({
    catalog: input.titles,
    membershipTitleId,
  })

  return { membershipTitleId }
}

export type { OrganizationMembershipTitleProjection }
export {
  assertOrganizationMembershipTitleIdBelongsToCatalog,
  assertOrganizationMembershipTitleIdUnused,
  assertOrganizationMembershipTitlesCatalogUpdateAllowed,
  countOrganizationMembershipTitleIdUsage,
  materializeOrganizationMembershipCatalogForRequiredTitleIds,
  migrateOrganizationMembershipEdgesToTitleIds,
  resolveOrganizationMembershipTitleProjection,
  resolveOptionalOrganizationMembershipTitleProjection,
} from './membership-title-projection'
