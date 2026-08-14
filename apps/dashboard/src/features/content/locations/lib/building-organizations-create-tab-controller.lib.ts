import type { Organization, OrganizationLocationConnectionKind } from '@rpg/contracts'

import type { CreateWorkflowDraftPanelController } from '@/lib/create-flow'

import type { OrganizationFormValues } from '../../lib/forms/organization-form-projection'
import {
  buildBuildingOrganizationRelationshipKindOptions,
  createBuildingOrganizationDraftId,
  resolveBuildingOrganizationDiscoveryAddState,
  upsertBuildingOrganizationRelationshipDraft,
  type BuildingOrganizationDraftIssue,
  type BuildingOrganizationDraftPlan,
  type BuildingOrganizationRelationshipDraft,
} from './building-organization-create-drafts'
import { BUILDING_ORGANIZATIONS_IN_PROGRESS_MESSAGE } from './building-organizations-create-tab.lib'

export type BuildingOrganizationComposerStage = 'intent' | 'discovery' | 'review' | 'branch'

export type BuildingOrganizationComposerTarget =
  BuildingOrganizationRelationshipDraft['organization']

export function organizationTargetEligibleForKind(input: {
  kind: OrganizationLocationConnectionKind
  organization: BuildingOrganizationComposerTarget
  kindOptionsFor: (
    organization?: BuildingOrganizationRelationshipDraft['organization'],
    relationshipDraftId?: string,
  ) => ReturnType<typeof buildBuildingOrganizationRelationshipKindOptions>
  relationshipDraftId?: string
}): boolean {
  const options = input.kindOptionsFor(input.organization, input.relationshipDraftId)
  const option = options.find((candidate) => candidate.value === input.kind)
  return Boolean(option && !option.disabled)
}

export function resolveBuildingOrganizationEffectiveKind(input: {
  kind: OrganizationLocationConnectionKind | null
  requestedMode: 'add' | 'pending'
  composerStage: BuildingOrganizationComposerStage
  editingDraftId: string | null
  intentState: ReturnType<typeof resolveBuildingOrganizationDiscoveryAddState>
}): OrganizationLocationConnectionKind | null {
  return (
    input.kind ??
    (input.requestedMode === 'add' &&
    input.composerStage === 'intent' &&
    input.editingDraftId == null
      ? (input.intentState.singleEligibleValue ?? null)
      : null)
  )
}

export function resolveBuildingOrganizationComposerStage(input: {
  composerStage: BuildingOrganizationComposerStage
  effectiveKind: OrganizationLocationConnectionKind | null
  kind: OrganizationLocationConnectionKind | null
  intentState: ReturnType<typeof resolveBuildingOrganizationDiscoveryAddState>
}): BuildingOrganizationComposerStage {
  if (
    input.composerStage === 'intent' &&
    input.effectiveKind != null &&
    input.intentState.singleEligibleValue != null &&
    input.kind == null
  ) {
    return 'discovery'
  }
  return input.composerStage
}

export function resolveBuildingOrganizationInProgress(input: {
  editingDraftId: string | null
  requestedMode: 'add' | 'pending'
  composerStage: BuildingOrganizationComposerStage
  effectiveKind: OrganizationLocationConnectionKind | null
}): boolean {
  return (
    input.editingDraftId != null ||
    (input.requestedMode === 'add' &&
      (input.composerStage === 'branch' ||
        input.effectiveKind != null ||
        input.composerStage === 'review'))
  )
}

export function resolveBuildingOrganizationVisibleIssues(input: {
  validationAttempted: boolean
  inProgress: boolean
  planIssues: readonly BuildingOrganizationDraftIssue[]
}): BuildingOrganizationDraftIssue[] {
  return input.validationAttempted && input.inProgress
    ? [...input.planIssues, { message: BUILDING_ORGANIZATIONS_IN_PROGRESS_MESSAGE }]
    : [...input.planIssues]
}

export function resolveBuildingOrganizationCommitKind(input: {
  kind: OrganizationLocationConnectionKind | null
  singleEligibleValue?: OrganizationLocationConnectionKind
}): OrganizationLocationConnectionKind | null {
  return input.kind ?? input.singleEligibleValue ?? null
}

export function buildExistingOrganizationCommitPlan(input: {
  plan: BuildingOrganizationDraftPlan
  kind: OrganizationLocationConnectionKind
  organizationId: string
}): BuildingOrganizationDraftPlan {
  return upsertBuildingOrganizationRelationshipDraft({
    plan: input.plan,
    relationship: {
      draftId: createBuildingOrganizationDraftId(),
      kind: input.kind,
      organization: { kind: 'existing', organizationId: input.organizationId },
    },
  })
}

export function buildNewOrganizationCommitPlan(input: {
  plan: BuildingOrganizationDraftPlan
  kind: OrganizationLocationConnectionKind
  draftOrganizationId: string
  values: OrganizationFormValues
}): BuildingOrganizationDraftPlan {
  return upsertBuildingOrganizationRelationshipDraft({
    plan: input.plan,
    relationship: {
      draftId: createBuildingOrganizationDraftId(),
      kind: input.kind,
      organization: { kind: 'new', draftOrganizationId: input.draftOrganizationId },
    },
    organizationDraft: {
      draftOrganizationId: input.draftOrganizationId,
      values: input.values,
    },
  })
}

export function buildPendingOrganizationCommitPlan(input: {
  plan: BuildingOrganizationDraftPlan
  relationship: BuildingOrganizationRelationshipDraft
  kind: OrganizationLocationConnectionKind
  organization: BuildingOrganizationComposerTarget
}): BuildingOrganizationDraftPlan {
  return upsertBuildingOrganizationRelationshipDraft({
    plan: input.plan,
    relationship: { ...input.relationship, kind: input.kind, organization: input.organization },
  })
}

export function createBuildingOrganizationPanelController(input: {
  plan: BuildingOrganizationDraftPlan
  reset: () => void
  validationIssueCount: number
  focusFirstIssue: () => void
  hydrateServerIssues: (issues: readonly BuildingOrganizationDraftIssue[]) => void
}): CreateWorkflowDraftPanelController<
  BuildingOrganizationDraftPlan,
  BuildingOrganizationDraftIssue
> {
  return {
    getPayload: () => input.plan,
    reset: input.reset,
    hydrateServerIssues: input.hydrateServerIssues,
    validate: async () => ({
      valid: input.validationIssueCount === 0,
      issueCount: input.validationIssueCount,
    }),
    focusFirstIssue: input.focusFirstIssue,
  }
}

export function filterVisibleOrganizations(
  organizations: readonly Organization[],
  searchQuery: string,
  getDomainLabel: (organization: Organization) => string,
): Organization[] {
  const normalized = searchQuery.trim().toLocaleLowerCase()
  if (!normalized) return [...organizations]
  return organizations.filter((organization) =>
    `${organization.name} ${getDomainLabel(organization)}`.toLocaleLowerCase().includes(normalized),
  )
}

export function canConfirmBuildingOrganizationRelationship(input: {
  kind: OrganizationLocationConnectionKind | null
  selectedOrganization: BuildingOrganizationComposerTarget | null
  composerStage: BuildingOrganizationComposerStage
  organizationOptions: ReturnType<typeof buildBuildingOrganizationRelationshipKindOptions>
}): boolean {
  if (!input.kind || !input.selectedOrganization) return false
  if (input.composerStage !== 'review' && input.composerStage !== 'branch') return false
  return !input.organizationOptions.find((option) => option.value === input.kind)?.disabled
}
