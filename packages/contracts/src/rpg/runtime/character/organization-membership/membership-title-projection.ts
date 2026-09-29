import type { OrganizationMembershipTitleDefinition } from '../../../content/organization/membership-titles'
import {
  ORGANIZATION_DEFAULT_MEMBERSHIP_TITLE_LABEL,
  ORGANIZATION_MEMBERSHIP_TITLE_ID_PREFIX,
  createDefaultOrganizationMembershipTitleDefinition,
  createOrganizationMembershipTitleId,
  findRemovedOrganizationMembershipTitleIds,
  normalizeOrganizationMembershipTitleLabel,
  organizationMembershipTitlesSchema,
  resolveOrganizationMembershipTitleDefinitionByLabel,
} from '../../../content/organization/membership-titles'
import { ORGANIZATION_MEMBERSHIP_TITLE_PRIORITIES } from '../../../vocab/organization/member-title-entry'
import type { OrganizationMembershipTitlePriority } from '../../../vocab/organization/member-title-entry'

export const ORGANIZATION_MEMBERSHIP_TITLE_REFERENCE_STATUSES = [
  'none',
  'resolved',
  'broken',
] as const

export type OrganizationMembershipTitleReferenceStatus =
  (typeof ORGANIZATION_MEMBERSHIP_TITLE_REFERENCE_STATUSES)[number]

/** Read-side join of optional edge id + organization catalog. */
export type OrganizationMembershipTitleProjection =
  | { status: 'none' }
  | {
      status: 'resolved'
      membershipTitleId: string
      label: string
      priority: OrganizationMembershipTitlePriority
      npcRecommendation?: OrganizationMembershipTitleDefinition['npcRecommendation']
    }
  | { status: 'broken'; membershipTitleId: string }

const catalogPrioritySet = new Set<number>(ORGANIZATION_MEMBERSHIP_TITLE_PRIORITIES)

function isCatalogPriority(
  value: number | undefined,
): value is OrganizationMembershipTitlePriority {
  return value !== undefined && catalogPrioritySet.has(value)
}

export type OrganizationMembershipTitleDomainProjection = Exclude<
  OrganizationMembershipTitleProjection,
  { status: 'none' }
>

export function resolveOrganizationMembershipTitleProjection(input: {
  catalog: readonly OrganizationMembershipTitleDefinition[]
  membershipTitleId: string
}): OrganizationMembershipTitleDomainProjection {
  const membershipTitleId = input.membershipTitleId.trim()
  const row = input.catalog.find((entry) => entry.id === membershipTitleId)
  if (!row) {
    return { status: 'broken', membershipTitleId }
  }

  return {
    status: 'resolved',
    membershipTitleId: row.id,
    label: row.label,
    priority: row.priority,
    ...(row.npcRecommendation !== undefined ? { npcRecommendation: row.npcRecommendation } : {}),
  }
}

/** Defensive read path for malformed edges that omit a required membership title id. */
export function resolveOptionalOrganizationMembershipTitleProjection(input: {
  catalog: readonly OrganizationMembershipTitleDefinition[]
  membershipTitleId?: string | null
}): OrganizationMembershipTitleProjection {
  const membershipTitleId = input.membershipTitleId?.trim() || undefined
  if (membershipTitleId === undefined) {
    return { status: 'none' }
  }

  return resolveOrganizationMembershipTitleProjection({
    catalog: input.catalog,
    membershipTitleId,
  })
}

export function resolveOrganizationMembershipPriorityFromProjection(
  projection: OrganizationMembershipTitleProjection,
): number | undefined {
  return projection.status === 'resolved' ? projection.priority : undefined
}

export function assertOrganizationMembershipTitleIdBelongsToCatalog(input: {
  catalog: readonly OrganizationMembershipTitleDefinition[]
  membershipTitleId: string
}): void {
  if (!input.membershipTitleId.startsWith(ORGANIZATION_MEMBERSHIP_TITLE_ID_PREFIX)) {
    throw new Error('Organization membership title id must use the omt_ prefix.')
  }
  const projection = resolveOrganizationMembershipTitleProjection({
    catalog: input.catalog,
    membershipTitleId: input.membershipTitleId,
  })
  if (projection.status === 'broken') {
    throw new Error(
      `Organization membership title id is not in this organization's catalog: ${input.membershipTitleId}`,
    )
  }
}

type LegacyMembershipEdgeDetails = {
  lifecycle?: 'current' | 'former'
  title?: string
  priority?: number
  membershipTitleId?: string
}

export type MigratedMembershipRelationshipDetails = {
  lifecycle: 'current' | 'former'
  membershipTitleId?: string
}

function resolveLegacyEdgePriorityRank(
  edges: readonly { details?: LegacyMembershipEdgeDetails }[],
  normalizedLabel: string,
): OrganizationMembershipTitlePriority {
  const priorities = edges
    .map((edge) => edge.details)
    .filter((details): details is LegacyMembershipEdgeDetails => details !== undefined)
    .filter((details) => {
      const title = details.title?.trim()
      if (!title) return false
      return normalizeOrganizationMembershipTitleLabel(title) === normalizedLabel
    })
    .map((details) => details.priority)
    .filter((priority): priority is number => priority !== undefined)

  if (priorities.length === 0) {
    return 10
  }

  const first = priorities[0]!
  if (priorities.every((priority) => priority === first) && isCatalogPriority(first)) {
    return first
  }

  return 10
}

/** Dev-data transform: map legacy title/priority edges to catalog ids (clean break). */
export function migrateOrganizationMembershipEdgesToTitleIds(input: {
  catalog: readonly OrganizationMembershipTitleDefinition[]
  edges: readonly { details?: LegacyMembershipEdgeDetails }[]
  createId?: () => string
}): {
  catalog: OrganizationMembershipTitleDefinition[]
  edges: MigratedMembershipRelationshipDetails[]
} {
  const createId = input.createId ?? createOrganizationMembershipTitleId
  let catalog = [...input.catalog]
  const unmatchedLabels = new Map<string, string>()

  for (const edge of input.edges) {
    const details = edge.details ?? {}
    if (details.membershipTitleId !== undefined) {
      continue
    }
    const title = details.title?.trim()
    if (!title) {
      continue
    }
    const normalized = normalizeOrganizationMembershipTitleLabel(title)
    if (unmatchedLabels.has(normalized)) {
      continue
    }
    if (resolveOrganizationMembershipTitleDefinitionByLabel(catalog, title)) {
      continue
    }
    unmatchedLabels.set(normalized, title)
  }

  for (const [normalized, label] of unmatchedLabels) {
    const priority = resolveLegacyEdgePriorityRank(input.edges, normalized)
    catalog = [
      ...catalog,
      {
        id: createId(),
        label,
        priority,
      },
    ]
  }

  const edgeDetails = input.edges.map((edge) => {
    const details = edge.details ?? {}
    const lifecycle = details.lifecycle ?? 'current'

    if (details.membershipTitleId !== undefined) {
      return {
        lifecycle,
        membershipTitleId: details.membershipTitleId,
      }
    }

    const title = details.title?.trim()
    if (!title) {
      return { lifecycle }
    }

    const matched =
      resolveOrganizationMembershipTitleDefinitionByLabel(catalog, title) ??
      catalog.find(
        (entry) =>
          normalizeOrganizationMembershipTitleLabel(entry.label) ===
          normalizeOrganizationMembershipTitleLabel(title),
      )

    if (!matched) {
      return { lifecycle }
    }

    return {
      lifecycle,
      membershipTitleId: matched.id,
    }
  })

  return { catalog, edges: edgeDetails }
}

export function countOrganizationMembershipTitleIdUsage(input: {
  membershipTitleId: string
  edges: readonly { details?: { membershipTitleId?: string } }[]
}): number {
  return input.edges.filter((edge) => edge.details?.membershipTitleId === input.membershipTitleId)
    .length
}

type MembershipRelationshipDetailsInput = {
  lifecycle?: 'current' | 'former'
  membershipTitleId?: string
}

/** Attach resolver output to stored edge details for API/dashboard read models. */
export function enrichMembershipRelationshipDetailsForRead(input: {
  catalog: readonly OrganizationMembershipTitleDefinition[]
  details: MembershipRelationshipDetailsInput
}): Record<string, unknown> {
  const lifecycle = input.details.lifecycle ?? 'current'
  const membershipTitleId = input.details.membershipTitleId
  const projection = resolveOptionalOrganizationMembershipTitleProjection({
    catalog: input.catalog,
    membershipTitleId,
  })

  const base: Record<string, unknown> = {
    lifecycle,
    titleReferenceStatus: projection.status,
    ...(membershipTitleId !== undefined ? { membershipTitleId } : {}),
  }

  if (projection.status === 'resolved') {
    return {
      ...base,
      title: projection.label,
      priority: projection.priority,
      ...(projection.npcRecommendation !== undefined
        ? { npcRecommendation: projection.npcRecommendation }
        : {}),
    }
  }

  if (projection.status === 'broken') {
    return base
  }

  return base
}

export function projectOrganizationMemberMembership(input: {
  catalog: readonly OrganizationMembershipTitleDefinition[]
  membershipTitleId?: string
}): {
  membershipTitleId?: string
  titleReferenceStatus: OrganizationMembershipTitleReferenceStatus
  title?: string
  priority?: OrganizationMembershipTitlePriority
  npcRecommendation?: OrganizationMembershipTitleDefinition['npcRecommendation']
} {
  const projection = resolveOptionalOrganizationMembershipTitleProjection({
    catalog: input.catalog,
    membershipTitleId: input.membershipTitleId,
  })

  if (projection.status === 'none') {
    return { titleReferenceStatus: 'none' }
  }

  if (projection.status === 'broken') {
    return {
      membershipTitleId: projection.membershipTitleId,
      titleReferenceStatus: 'broken',
    }
  }

  return {
    membershipTitleId: projection.membershipTitleId,
    titleReferenceStatus: 'resolved',
    title: projection.label,
    priority: projection.priority,
    ...(projection.npcRecommendation !== undefined
      ? { npcRecommendation: projection.npcRecommendation }
      : {}),
  }
}

export function assertOrganizationMembershipTitleIdUnused(input: {
  membershipTitleId: string
  edges: readonly { details?: { membershipTitleId?: string } }[]
}): void {
  const usage = countOrganizationMembershipTitleIdUsage(input)
  if (usage > 0) {
    throw new Error(
      `Organization membership title id is referenced by ${usage} membership edge(s): ${input.membershipTitleId}`,
    )
  }
}

export function assertOrganizationMembershipTitlesCatalogUpdateAllowed(input: {
  previousCatalog: readonly OrganizationMembershipTitleDefinition[]
  nextCatalog: readonly OrganizationMembershipTitleDefinition[]
  edges: readonly { details?: { membershipTitleId?: string } }[]
}): void {
  const nextCatalog = organizationMembershipTitlesSchema.parse(input.nextCatalog)
  for (const removedId of findRemovedOrganizationMembershipTitleIds({
    previousCatalog: input.previousCatalog,
    nextCatalog,
  })) {
    assertOrganizationMembershipTitleIdUnused({
      membershipTitleId: removedId,
      edges: input.edges,
    })
  }
}

function resolveMemberFallbackTitleId(
  catalog: readonly OrganizationMembershipTitleDefinition[],
  createId: () => string,
): { catalog: OrganizationMembershipTitleDefinition[]; memberTitleId: string } {
  const existingMember = resolveOrganizationMembershipTitleDefinitionByLabel(
    catalog,
    ORGANIZATION_DEFAULT_MEMBERSHIP_TITLE_LABEL,
  )
  if (existingMember) {
    return { catalog: [...catalog], memberTitleId: existingMember.id }
  }
  const memberRow = createDefaultOrganizationMembershipTitleDefinition(createId)
  return {
    catalog: organizationMembershipTitlesSchema.parse([...catalog, memberRow]),
    memberTitleId: memberRow.id,
  }
}

/** Dev-data transform: one title minimum per organization and required ids on untitled edges. */
export function materializeOrganizationMembershipCatalogForRequiredTitleIds(input: {
  catalog: readonly OrganizationMembershipTitleDefinition[]
  edges: readonly { details?: LegacyMembershipEdgeDetails }[]
  createId?: () => string
}): {
  catalog: OrganizationMembershipTitleDefinition[]
  edges: MigratedMembershipRelationshipDetails[]
} {
  const createId = input.createId ?? createOrganizationMembershipTitleId
  const untitledEdges = input.edges.filter((edge) => edge.details?.membershipTitleId === undefined)

  let catalog = [...input.catalog]
  let memberTitleId: string | undefined

  if (untitledEdges.length > 0) {
    const resolved = resolveMemberFallbackTitleId(catalog, createId)
    catalog = resolved.catalog
    memberTitleId = resolved.memberTitleId
  } else if (catalog.length === 0) {
    const memberRow = createDefaultOrganizationMembershipTitleDefinition(createId)
    catalog = organizationMembershipTitlesSchema.parse([memberRow])
    memberTitleId = memberRow.id
  } else {
    catalog = organizationMembershipTitlesSchema.parse(catalog)
  }

  const edgeDetails = input.edges.map((edge) => {
    const details = edge.details ?? {}
    const lifecycle = details.lifecycle ?? 'current'

    if (details.membershipTitleId !== undefined) {
      return {
        lifecycle,
        membershipTitleId: details.membershipTitleId,
      }
    }

    if (memberTitleId === undefined) {
      return { lifecycle }
    }

    return {
      lifecycle,
      membershipTitleId: memberTitleId,
    }
  })

  return { catalog, edges: edgeDetails }
}
