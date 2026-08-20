import type { Organization, OrganizationLocationConnectionKind } from '@rpg/contracts'

import type { CreateWorkflowDraftPanelController } from '@/lib/create-flow'

import type { OrganizationFormValues } from '../../lib/forms/organization-form-projection'
import {
  createBuildingOrganizationDraftId,
  upsertBuildingOrganizationRelationshipDraft,
  type BuildingOrganizationDraftIssue,
  type BuildingOrganizationDraftPlan,
  type BuildingOrganizationRelationshipDraft,
  type BuildingOrganizationRelationshipKindOption,
} from './building-organization-create-drafts'
import { CREATE_SETUP_DEFAULT_CHANGE_LABEL } from '@/lib/create-setup'

import { BUILDING_ORGANIZATIONS_IN_PROGRESS_MESSAGE } from './building-organizations-create-tab.lib'
import {
  BUILDING_ORGANIZATIONS_NEW_FALLBACK_NAME,
  BUILDING_ORGANIZATIONS_ORGANIZATION_EYEBROW,
  BUILDING_ORGANIZATIONS_RELATIONSHIP_EYEBROW,
} from './building-organizations-create-tab.lib'

export type BuildingOrganizationComposerMode = 'resting' | 'composing'

export type BuildingOrganizationEditingDecision = 'relationship' | 'organization'

export type BuildingOrganizationComposerSummaryRow = {
  id: 'relationship' | 'organization'
  decision: BuildingOrganizationEditingDecision | 'organizationResolved'
  label: string
  value: string
}

export type BuildingOrganizationComposerView = {
  activeDecision: BuildingOrganizationEditingDecision | null
  showDiscovery: boolean
  showBranch: boolean
  showCommit: boolean
  showRelationshipChange: boolean
  showOrganizationChange: boolean
  summaryRows: readonly BuildingOrganizationComposerSummaryRow[]
}

export type BuildingOrganizationDiscoveryAddState = {
  eligibleCount: number
  addDisabled: boolean
  addDisabledReason?: string
  singleEligibleValue?: OrganizationLocationConnectionKind
}

export type BuildingOrganizationComposerStage = 'intent' | 'discovery' | 'review' | 'branch'

export type BuildingOrganizationComposerTarget =
  BuildingOrganizationRelationshipDraft['organization']

export function organizationTargetEligibleForKind(input: {
  kind: OrganizationLocationConnectionKind
  organization: BuildingOrganizationComposerTarget
  kindOptionsFor: (
    organization?: BuildingOrganizationRelationshipDraft['organization'],
    relationshipDraftId?: string,
  ) => readonly BuildingOrganizationRelationshipKindOption[]
  relationshipDraftId?: string
}): boolean {
  const options = input.kindOptionsFor(input.organization, input.relationshipDraftId)
  const option = options.find((candidate) => candidate.value === input.kind)
  return Boolean(option && !option.disabled)
}

export function resolveBuildingOrganizationEffectiveKind(input: {
  kind: OrganizationLocationConnectionKind | null
  composerMode: BuildingOrganizationComposerMode
  composerStage: BuildingOrganizationComposerStage
  editingDraftId: string | null
  intentState: BuildingOrganizationDiscoveryAddState
}): OrganizationLocationConnectionKind | null {
  return (
    input.kind ??
    (input.composerMode === 'composing' &&
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
  intentState: BuildingOrganizationDiscoveryAddState
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
  composerMode: BuildingOrganizationComposerMode
}): boolean {
  return input.composerMode === 'composing'
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

function buildRelationshipSummaryRow(kindLabel: string): BuildingOrganizationComposerSummaryRow {
  return {
    id: 'relationship',
    decision: 'relationship',
    label: BUILDING_ORGANIZATIONS_RELATIONSHIP_EYEBROW,
    value: kindLabel,
  }
}

function buildOrganizationSummaryRow(
  organizationName: string,
  organizationDomainLabel?: string | null,
): BuildingOrganizationComposerSummaryRow {
  const value = organizationDomainLabel
    ? `${organizationName} · ${organizationDomainLabel}`
    : organizationName
  return {
    id: 'organization',
    decision: 'organizationResolved',
    label: BUILDING_ORGANIZATIONS_ORGANIZATION_EYEBROW,
    value,
  }
}

export function resolveBuildingOrganizationHasResolvedOrganizationTarget(input: {
  selectedOrganization: BuildingOrganizationComposerTarget | null
  organizationName: string | null
}): boolean {
  if (!input.selectedOrganization || !input.organizationName) return false
  if (input.selectedOrganization.kind === 'existing') return true
  return input.organizationName !== BUILDING_ORGANIZATIONS_NEW_FALLBACK_NAME
}

function emptyBuildingOrganizationComposerView(): BuildingOrganizationComposerView {
  return {
    activeDecision: null,
    showDiscovery: false,
    showBranch: false,
    showCommit: false,
    showRelationshipChange: false,
    showOrganizationChange: false,
    summaryRows: [],
  }
}

function resolveRelationshipKindChangeVisible(relationshipKindCount: number): boolean {
  return relationshipKindCount > 1
}

function buildRelationshipOnlySummaryView(input: {
  relationshipRow: BuildingOrganizationComposerSummaryRow | null
  relationshipKindCount: number
  activeDecision: BuildingOrganizationComposerView['activeDecision']
  showDiscovery?: boolean
  showBranch?: boolean
}): BuildingOrganizationComposerView {
  return {
    activeDecision: input.activeDecision,
    showDiscovery: input.showDiscovery ?? false,
    showBranch: input.showBranch ?? false,
    showCommit: false,
    showRelationshipChange: resolveRelationshipKindChangeVisible(input.relationshipKindCount),
    showOrganizationChange: false,
    summaryRows: input.relationshipRow ? [input.relationshipRow] : [],
  }
}

function resolveReviewStageView(input: {
  relationshipRow: BuildingOrganizationComposerSummaryRow | null
  organizationName: string | null
  organizationDomainLabel: string | null
  hasResolvedOrganization: boolean
  relationshipKindCount: number
}): BuildingOrganizationComposerView {
  const organizationRow =
    input.hasResolvedOrganization && input.organizationName
      ? buildOrganizationSummaryRow(input.organizationName, input.organizationDomainLabel)
      : null
  const summaryRows = [
    ...(input.relationshipRow ? [input.relationshipRow] : []),
    ...(organizationRow ? [organizationRow] : []),
  ]

  return {
    activeDecision: null,
    showDiscovery: false,
    showBranch: false,
    showCommit: summaryRows.length >= 2,
    showRelationshipChange: resolveRelationshipKindChangeVisible(input.relationshipKindCount),
    showOrganizationChange: Boolean(organizationRow),
    summaryRows,
  }
}

function resolveStageComposerView(input: {
  composerStage: BuildingOrganizationComposerStage
  relationshipRow: BuildingOrganizationComposerSummaryRow | null
  organizationName: string | null
  organizationDomainLabel: string | null
  hasKind: boolean
  hasResolvedOrganization: boolean
  relationshipKindCount: number
}): BuildingOrganizationComposerView {
  switch (input.composerStage) {
    case 'intent':
      return {
        ...emptyBuildingOrganizationComposerView(),
        activeDecision: input.hasKind ? null : 'relationship',
        showRelationshipChange: resolveRelationshipKindChangeVisible(input.relationshipKindCount),
      }
    case 'discovery':
      return buildRelationshipOnlySummaryView({
        relationshipRow: input.relationshipRow,
        relationshipKindCount: input.relationshipKindCount,
        activeDecision: 'organization',
        showDiscovery: true,
      })
    case 'branch':
      return buildRelationshipOnlySummaryView({
        relationshipRow: input.relationshipRow,
        relationshipKindCount: input.relationshipKindCount,
        activeDecision: 'organization',
        showBranch: true,
      })
    case 'review':
      return resolveReviewStageView(input)
    default:
      return emptyBuildingOrganizationComposerView()
  }
}

export function resolveBuildingOrganizationComposerView(input: {
  composerStage: BuildingOrganizationComposerStage
  editingDecision: BuildingOrganizationEditingDecision | null
  kindLabel: string | null
  organizationName: string | null
  organizationDomainLabel: string | null
  hasKind: boolean
  hasResolvedOrganization: boolean
  relationshipKindCount: number
}): BuildingOrganizationComposerView {
  const relationshipKindChangeVisible = resolveRelationshipKindChangeVisible(
    input.relationshipKindCount,
  )

  if (input.editingDecision === 'relationship') {
    return {
      ...emptyBuildingOrganizationComposerView(),
      activeDecision: 'relationship',
      showRelationshipChange: relationshipKindChangeVisible,
    }
  }

  const relationshipRow =
    input.hasKind && input.kindLabel ? buildRelationshipSummaryRow(input.kindLabel) : null

  if (input.editingDecision === 'organization') {
    return buildRelationshipOnlySummaryView({
      relationshipRow,
      relationshipKindCount: input.relationshipKindCount,
      activeDecision: 'organization',
      showDiscovery: true,
    })
  }

  return resolveStageComposerView({
    composerStage: input.composerStage,
    relationshipRow,
    organizationName: input.organizationName,
    organizationDomainLabel: input.organizationDomainLabel,
    hasKind: input.hasKind,
    hasResolvedOrganization: input.hasResolvedOrganization,
    relationshipKindCount: input.relationshipKindCount,
  })
}

export const BUILDING_ORGANIZATION_COMPOSER_CHANGE_LABEL = CREATE_SETUP_DEFAULT_CHANGE_LABEL

export function canConfirmBuildingOrganizationRelationship(input: {
  kind: OrganizationLocationConnectionKind | null
  selectedOrganization: BuildingOrganizationComposerTarget | null
  composerStage: BuildingOrganizationComposerStage
  organizationOptions: readonly BuildingOrganizationRelationshipKindOption[]
}): boolean {
  if (!input.kind || !input.selectedOrganization) return false
  if (input.composerStage !== 'review' && input.composerStage !== 'branch') return false
  return !input.organizationOptions.find((option) => option.value === input.kind)?.disabled
}
