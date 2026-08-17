import { z } from 'zod'

import type { OrganizationMembershipTitleDefinition } from '../../content/organization-membership-titles'
import { resolveOrganizationMembershipTitleDefinitionByLabel } from '../../content/organization-membership-titles'
import { comparePriorityDescending } from '../../vocab/types'
import { characterOrganizationConnectionSchema } from './connections'

/** Body for nested POST …/organization-memberships. */
export const createCharacterOrganizationMembershipInputSchema =
  characterOrganizationConnectionSchema

export type CreateCharacterOrganizationMembershipInput = z.infer<
  typeof createCharacterOrganizationMembershipInputSchema
>

/**
 * Body for nested PATCH …/organization-memberships/:organizationId.
 *
 * `title` and `priority` are both required: a value sets the field; `null` clears it.
 * Omission fails validation so accidental clears cannot happen via missing fields.
 * Both update atomically in one request.
 */
export const updateCharacterOrganizationMembershipInputSchema = z.object({
  title: z.union([z.string().trim().min(1).max(80), z.null()]),
  priority: z.union([z.number().int(), z.null()]),
})

export type UpdateCharacterOrganizationMembershipInput = z.infer<
  typeof updateCharacterOrganizationMembershipInputSchema
>

type MembershipPrioritySource = {
  readonly title?: string
  readonly priority?: number
}

/**
 * Effective roster priority for a membership.
 *
 * Explicit persisted `membership.priority` is authoritative. Organization catalog
 * fallback only applies when priority is absent (legacy / unranked records).
 */
export function resolveOrganizationMembershipPriority(input: {
  membership: MembershipPrioritySource
  titles: readonly OrganizationMembershipTitleDefinition[]
}): number | undefined {
  if (input.membership.priority !== undefined) {
    return input.membership.priority
  }
  const title = input.membership.title
  if (title === undefined) return undefined
  return resolveOrganizationMembershipTitleDefinitionByLabel(input.titles, title)?.priority
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
  readonly title: string | undefined
  readonly priority: number | undefined
}

/**
 * Single owner of title → membership stamping for create/update editors.
 *
 * - Organization catalog title → that definition's label + priority
 * - No title → clear both title and priority
 * - Preserved historical/custom title → keep the current membership's explicit priority
 */
export function resolveOrganizationMembershipMetadata(input: {
  titles: readonly OrganizationMembershipTitleDefinition[]
  /** Selected title after radio mapping; `undefined` means No title. */
  selectedTitle: string | undefined
  currentMembership?: MembershipPrioritySource
}): ResolvedOrganizationMembershipMetadata {
  const selectedTitle = input.selectedTitle?.trim() || undefined
  if (selectedTitle === undefined) {
    return { title: undefined, priority: undefined }
  }

  const catalogTitle = resolveOrganizationMembershipTitleDefinitionByLabel(
    input.titles,
    selectedTitle,
  )
  if (catalogTitle) {
    return { title: catalogTitle.label, priority: catalogTitle.priority }
  }

  return {
    title: selectedTitle,
    priority: input.currentMembership?.priority,
  }
}
