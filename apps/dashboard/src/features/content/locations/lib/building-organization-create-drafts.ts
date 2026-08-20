import {
  getOrganizationLocationConnectionLabel,
  organizationLocationConnectionKindBlockedForLocation,
  ORGANIZATION_LOCATION_CONNECTION_ENTRIES,
  resolveLocationConnectionEligibility,
  type Organization,
  type OrganizationLocationConnectionEdgeAtLocation,
  type OrganizationLocationConnectionKind,
} from '@rpg/contracts'

import { buildOrganizationLocationConnectionKindOptions } from '../../lib/location-connection-kind-options'
import {
  organizationFormSchema,
  type OrganizationFormValues,
} from '../../lib/forms/organization-form-projection'

export const PENDING_BUILDING_LOCATION_ID = 'pending-building' as const
export const NEW_ORGANIZATION_SUBJECT_PREFIX = 'draft-organization:' as const

export type BuildingOrganizationDraft = Readonly<{
  draftOrganizationId: string
  values: OrganizationFormValues
}>

export type BuildingOrganizationRelationshipDraft = Readonly<{
  draftId: string
  kind: OrganizationLocationConnectionKind
  organization:
    | Readonly<{ kind: 'existing'; organizationId: string }>
    | Readonly<{ kind: 'new'; draftOrganizationId: string }>
}>

export type BuildingOrganizationDraftPlan = Readonly<{
  organizations: readonly BuildingOrganizationDraft[]
  relationships: readonly BuildingOrganizationRelationshipDraft[]
}>

export type BuildingOrganizationDraftIssue = Readonly<{
  message: string
  organizationDraftId?: string
  relationshipDraftId?: string
}>

export const EMPTY_BUILDING_ORGANIZATION_DRAFT_PLAN: BuildingOrganizationDraftPlan = {
  organizations: [],
  relationships: [],
}

export type BuildingOrganizationRelationshipKindOption = Readonly<{
  value: OrganizationLocationConnectionKind
  label: string
  description: string
  disabled?: boolean
  disabledReason?: string
}>

export function createBuildingOrganizationDraftId(): string {
  return crypto.randomUUID()
}

export function organizationSubjectKey(
  target: BuildingOrganizationRelationshipDraft['organization'],
): string {
  return target.kind === 'existing'
    ? target.organizationId
    : `${NEW_ORGANIZATION_SUBJECT_PREFIX}${target.draftOrganizationId}`
}

function issueKey(issue: BuildingOrganizationDraftIssue): string {
  return `${issue.organizationDraftId ?? ''}:${issue.relationshipDraftId ?? ''}:${issue.message}`
}

function uniqueIssues(
  issues: readonly BuildingOrganizationDraftIssue[],
): BuildingOrganizationDraftIssue[] {
  const seen = new Set<string>()
  return issues.filter((issue) => {
    const key = issueKey(issue)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function pendingConnectionsForSubject(
  relationships: readonly BuildingOrganizationRelationshipDraft[],
  subjectKey: string,
) {
  return relationships
    .filter((relationship) => organizationSubjectKey(relationship.organization) === subjectKey)
    .map((relationship) => ({
      id: relationship.draftId,
      locationId: PENDING_BUILDING_LOCATION_ID,
      kind: relationship.kind,
    }))
}

function pendingEdges(
  relationships: readonly BuildingOrganizationRelationshipDraft[],
): OrganizationLocationConnectionEdgeAtLocation[] {
  return relationships.map((relationship) => ({
    organizationId: organizationSubjectKey(relationship.organization),
    connectionId: relationship.draftId,
    locationId: PENDING_BUILDING_LOCATION_ID,
    kind: relationship.kind,
  }))
}

function validateOrganizationDraft(
  draft: BuildingOrganizationDraft,
  seenIds: Set<string>,
): BuildingOrganizationDraftIssue[] {
  const issues: BuildingOrganizationDraftIssue[] = []
  if (!draft.draftOrganizationId || seenIds.has(draft.draftOrganizationId)) {
    issues.push({
      organizationDraftId: draft.draftOrganizationId,
      message: 'New Organization drafts must have unique identities.',
    })
  }
  seenIds.add(draft.draftOrganizationId)

  const parsed = organizationFormSchema.safeParse(draft.values)
  if (parsed.success) return issues
  return [
    ...issues,
    ...parsed.error.issues.map((issue) => ({
      organizationDraftId: draft.draftOrganizationId,
      message: issue.message,
    })),
  ]
}

type RelationshipValidationContext = Readonly<{
  plan: BuildingOrganizationDraftPlan
  organizationsById: ReadonlyMap<string, Organization>
  newOrganizationsById: ReadonlyMap<string, BuildingOrganizationDraft>
  eligibleKinds: readonly OrganizationLocationConnectionKind[]
  edgesAtLocation: readonly OrganizationLocationConnectionEdgeAtLocation[]
}>

function validateRelationshipTarget(
  relationship: BuildingOrganizationRelationshipDraft,
  context: RelationshipValidationContext,
): BuildingOrganizationDraftIssue | undefined {
  if (
    relationship.organization.kind === 'existing' &&
    !context.organizationsById.has(relationship.organization.organizationId)
  ) {
    return {
      relationshipDraftId: relationship.draftId,
      message: 'The selected Organization is no longer available.',
    }
  }
  if (
    relationship.organization.kind === 'new' &&
    !context.newOrganizationsById.has(relationship.organization.draftOrganizationId)
  ) {
    return {
      relationshipDraftId: relationship.draftId,
      message: 'The new Organization draft is missing.',
    }
  }
  return undefined
}

function relationshipPolicyIssue(
  relationship: BuildingOrganizationRelationshipDraft,
  context: RelationshipValidationContext,
): BuildingOrganizationDraftIssue | undefined {
  const subjectKey = organizationSubjectKey(relationship.organization)
  const existingOrganization =
    relationship.organization.kind === 'existing'
      ? context.organizationsById.get(relationship.organization.organizationId)
      : undefined
  const connections = [
    ...(existingOrganization?.connections.locations ?? []),
    ...pendingConnectionsForSubject(context.plan.relationships, subjectKey),
  ]
  const blocked = organizationLocationConnectionKindBlockedForLocation({
    locationId: PENDING_BUILDING_LOCATION_ID,
    kind: relationship.kind,
    subjectOrganizationId: subjectKey,
    connections,
    edgesAtLocation: context.edgesAtLocation,
    excludeConnectionId: relationship.draftId,
  })
  return blocked
    ? {
        relationshipDraftId: relationship.draftId,
        message: `${getOrganizationLocationConnectionLabel(relationship.kind)} conflicts with another persisted or pending relationship.`,
      }
    : undefined
}

function validateRelationshipDraft(
  relationship: BuildingOrganizationRelationshipDraft,
  seenIds: Set<string>,
  context: RelationshipValidationContext,
): BuildingOrganizationDraftIssue[] {
  const issues: BuildingOrganizationDraftIssue[] = []
  if (!relationship.draftId || seenIds.has(relationship.draftId)) {
    issues.push({
      relationshipDraftId: relationship.draftId,
      message: 'Relationship drafts must have unique identities.',
    })
  }
  seenIds.add(relationship.draftId)

  if (!context.eligibleKinds.includes(relationship.kind)) {
    return [
      ...issues,
      {
        relationshipDraftId: relationship.draftId,
        message: `${getOrganizationLocationConnectionLabel(relationship.kind)} is not eligible for a Building.`,
      },
    ]
  }
  const targetIssue = validateRelationshipTarget(relationship, context)
  if (targetIssue) return [...issues, targetIssue]
  const policyIssue = relationshipPolicyIssue(relationship, context)
  return policyIssue ? [...issues, policyIssue] : issues
}

export function validateBuildingOrganizationDraftPlan(input: {
  plan: BuildingOrganizationDraftPlan
  existingOrganizations: readonly Organization[]
  serverIssues?: readonly BuildingOrganizationDraftIssue[]
}): BuildingOrganizationDraftIssue[] {
  const { plan } = input
  const organizationDraftIds = new Set<string>()
  const relationshipDraftIds = new Set<string>()
  const context: RelationshipValidationContext = {
    plan,
    organizationsById: new Map(input.existingOrganizations.map((item) => [item.id, item])),
    newOrganizationsById: new Map(
      plan.organizations.map((draft) => [draft.draftOrganizationId, draft]),
    ),
    eligibleKinds: resolveLocationConnectionEligibility({
      kind: 'structure',
      structureType: 'building',
    }).organizationKinds,
    edgesAtLocation: pendingEdges(plan.relationships),
  }
  const organizationIssues = plan.organizations.flatMap((draft) =>
    validateOrganizationDraft(draft, organizationDraftIds),
  )
  const relationshipIssues = plan.relationships.flatMap((relationship) =>
    validateRelationshipDraft(relationship, relationshipDraftIds, context),
  )
  return uniqueIssues([...(input.serverIssues ?? []), ...organizationIssues, ...relationshipIssues])
}

export const BUILDING_ORGANIZATION_NO_ELIGIBLE_KIND_REASON =
  'No eligible relationships for this Organization.'

export const BUILDING_ORGANIZATION_NO_INTENT_KIND_REASON =
  'No eligible relationship kinds remain for this building.'

export function resolveBuildingOrganizationDiscoveryAddState(
  options: readonly BuildingOrganizationRelationshipKindOption[],
): {
  eligibleCount: number
  addDisabled: boolean
  addDisabledReason?: string
  singleEligibleValue?: OrganizationLocationConnectionKind
} {
  const eligible = options.filter((option) => !option.disabled)
  if (eligible.length === 0) {
    return {
      eligibleCount: 0,
      addDisabled: true,
      addDisabledReason:
        options.find((option) => option.disabledReason)?.disabledReason ??
        BUILDING_ORGANIZATION_NO_ELIGIBLE_KIND_REASON,
    }
  }
  return {
    eligibleCount: eligible.length,
    addDisabled: false,
    ...(eligible.length === 1 ? { singleEligibleValue: eligible[0]?.value } : {}),
  }
}

export function buildBuildingOrganizationRelationshipKindOptions(input: {
  plan: BuildingOrganizationDraftPlan
  existingOrganizations: readonly Organization[]
  organization?: BuildingOrganizationRelationshipDraft['organization']
  relationshipDraftId?: string
}): BuildingOrganizationRelationshipKindOption[] {
  const eligibleKinds = resolveLocationConnectionEligibility({
    kind: 'structure',
    structureType: 'building',
  }).organizationKinds
  if (!input.organization) {
    return buildOrganizationLocationConnectionKindOptions({
      locationId: PENDING_BUILDING_LOCATION_ID,
      kinds: eligibleKinds,
      edgesAtLocation: pendingEdges(input.plan.relationships),
    }).map((option) => ({
      value: option.value as OrganizationLocationConnectionKind,
      label: option.label,
      description: option.description,
      ...(option.disabled ? { disabled: true, disabledReason: option.disabledReason } : {}),
    }))
  }

  const candidateDraftId = input.relationshipDraftId ?? 'relationship-kind-candidate'
  return eligibleKinds.map((value) => {
    const candidate = upsertBuildingOrganizationRelationshipDraft({
      plan: input.plan,
      relationship: {
        draftId: candidateDraftId,
        kind: value,
        organization: input.organization!,
      },
    })
    const conflict = validateBuildingOrganizationDraftPlan({
      plan: candidate,
      existingOrganizations: input.existingOrganizations,
    }).find(
      (issue) =>
        issue.relationshipDraftId === candidateDraftId && issue.message.includes('conflicts'),
    )
    return {
      value,
      label: getOrganizationLocationConnectionLabel(value),
      description: ORGANIZATION_LOCATION_CONNECTION_ENTRIES[value].description,
      ...(conflict ? { disabled: true, disabledReason: conflict.message } : {}),
    }
  })
}

export function resolveBuildingOrganizationSelectState(input: {
  kind: OrganizationLocationConnectionKind | null
  options: readonly BuildingOrganizationRelationshipKindOption[]
}): {
  selectDisabled: boolean
  selectDisabledReason?: string
} {
  if (!input.kind) {
    return {
      selectDisabled: true,
      selectDisabledReason: BUILDING_ORGANIZATION_NO_ELIGIBLE_KIND_REASON,
    }
  }

  const option = input.options.find((candidate) => candidate.value === input.kind)
  if (!option || option.disabled) {
    return {
      selectDisabled: true,
      selectDisabledReason:
        option?.disabledReason ??
        `${getOrganizationLocationConnectionLabel(input.kind)} is not eligible for this Organization.`,
    }
  }

  return { selectDisabled: false }
}

export function upsertBuildingOrganizationRelationshipDraft(input: {
  plan: BuildingOrganizationDraftPlan
  relationship: BuildingOrganizationRelationshipDraft
  organizationDraft?: BuildingOrganizationDraft
}): BuildingOrganizationDraftPlan {
  const relationships = input.plan.relationships.some(
    (draft) => draft.draftId === input.relationship.draftId,
  )
    ? input.plan.relationships.map((draft) =>
        draft.draftId === input.relationship.draftId ? input.relationship : draft,
      )
    : [...input.plan.relationships, input.relationship]

  if (!input.organizationDraft) {
    return { ...input.plan, relationships }
  }

  const organizations = input.plan.organizations.some(
    (draft) => draft.draftOrganizationId === input.organizationDraft?.draftOrganizationId,
  )
    ? input.plan.organizations.map((draft) =>
        draft.draftOrganizationId === input.organizationDraft?.draftOrganizationId
          ? input.organizationDraft!
          : draft,
      )
    : [...input.plan.organizations, input.organizationDraft]

  return { organizations, relationships }
}

export function removeBuildingOrganizationRelationshipDraft(
  plan: BuildingOrganizationDraftPlan,
  relationshipDraftId: string,
): BuildingOrganizationDraftPlan {
  const removed = plan.relationships.find((draft) => draft.draftId === relationshipDraftId)
  const relationships = plan.relationships.filter((draft) => draft.draftId !== relationshipDraftId)
  if (!removed || removed.organization.kind !== 'new') {
    return { ...plan, relationships }
  }
  const removedDraftOrganizationId = removed.organization.draftOrganizationId

  const stillReferenced = relationships.some(
    (draft) =>
      draft.organization.kind === 'new' &&
      draft.organization.draftOrganizationId === removedDraftOrganizationId,
  )
  return {
    relationships,
    organizations: stillReferenced
      ? plan.organizations
      : plan.organizations.filter(
          (draft) => draft.draftOrganizationId !== removedDraftOrganizationId,
        ),
  }
}

export type BuildingCreateTransactionSummary = Readonly<{
  newOrganizationCount: number
  submitLabel: string
}>

export function resolveBuildingCreateTransactionSummary(
  plan: BuildingOrganizationDraftPlan,
): BuildingCreateTransactionSummary {
  const newOrganizationCount = plan.organizations.length
  if (newOrganizationCount === 0) {
    return { newOrganizationCount, submitLabel: 'Create building' }
  }
  if (newOrganizationCount === 1) {
    return { newOrganizationCount, submitLabel: 'Create building and organization' }
  }
  return {
    newOrganizationCount,
    submitLabel: `Create building and ${newOrganizationCount} organizations`,
  }
}
