'use client'

import * as React from 'react'
import {
  getOrganizationDomainLabel,
  type Organization,
  type OrganizationLocationConnectionKind,
} from '@rpg/contracts'

import type {
  AddPendingWorkflowMode,
  CreateWorkflowDraftPanelController,
  CreateWorkflowPanelStatus,
} from '@/lib/create-flow'

import { useOrganizations } from '../../organizations'
import type { ContentFormCtx } from '../../lib/forms/content-form-registry'
import type { OrganizationFormValues } from '../../lib/forms/organization-form-projection'
import {
  buildBuildingOrganizationRelationshipKindOptions,
  createBuildingOrganizationDraftId,
  EMPTY_BUILDING_ORGANIZATION_DRAFT_PLAN,
  removeBuildingOrganizationRelationshipDraft,
  resolveBuildingOrganizationDiscoveryAddState,
  upsertBuildingOrganizationRelationshipDraft,
  validateBuildingOrganizationDraftPlan,
  type BuildingOrganizationDraftIssue,
  type BuildingOrganizationDraftPlan,
  type BuildingOrganizationRelationshipDraft,
} from '../lib/building-organization-create-drafts'
import {
  BUILDING_ORGANIZATIONS_IN_PROGRESS_MESSAGE,
  buildingOrganizationPendingItemId,
  parseBuildingOrganizationDiscoveryItemId,
  parseBuildingOrganizationPendingItemId,
} from '../lib/building-organizations-create-tab.lib'

export type UseBuildingOrganizationsCreateTabInput = {
  campaignId: string
  formCtx?: ContentFormCtx
  initialPlan?: BuildingOrganizationDraftPlan
  initialMode?: AddPendingWorkflowMode
  organizationItems?: readonly Organization[]
  controllerRef?: React.MutableRefObject<CreateWorkflowDraftPanelController<
    BuildingOrganizationDraftPlan,
    BuildingOrganizationDraftIssue
  > | null>
  onStatusChange?: (status: CreateWorkflowPanelStatus) => void
  onPlanChange?: (plan: BuildingOrganizationDraftPlan) => void
}

export function useBuildingOrganizationsCreateTab({
  campaignId,
  formCtx,
  initialPlan = EMPTY_BUILDING_ORGANIZATION_DRAFT_PLAN,
  initialMode,
  organizationItems,
  controllerRef,
  onStatusChange,
  onPlanChange,
}: UseBuildingOrganizationsCreateTabInput) {
  const rootRef = React.useRef<HTMLDivElement | null>(null)
  const { data: queriedOrganizations = [], isPending, isError } = useOrganizations(campaignId)
  const organizations = organizationItems ?? queriedOrganizations
  const [plan, setPlan] = React.useState<BuildingOrganizationDraftPlan>(initialPlan)
  const [requestedMode, setRequestedMode] = React.useState<AddPendingWorkflowMode>(
    initialMode ?? (initialPlan.relationships.length > 0 ? 'pending' : 'add'),
  )
  const [expandedItemId, setExpandedItemId] = React.useState<string | null>(null)
  const [newOrganizationBranch, setNewOrganizationBranch] = React.useState(false)
  const [newOrganizationDraftId, setNewOrganizationDraftId] = React.useState<string | null>(null)
  const [kind, setKind] = React.useState<OrganizationLocationConnectionKind | null>(null)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [validationAttempted, setValidationAttempted] = React.useState(false)
  const [serverIssues, setServerIssues] = React.useState<readonly BuildingOrganizationDraftIssue[]>(
    [],
  )

  const inProgress = expandedItemId != null || newOrganizationBranch

  const resetEditor = React.useCallback(() => {
    setKind(null)
    setSearchQuery('')
    setExpandedItemId(null)
    setNewOrganizationBranch(false)
    setNewOrganizationDraftId(null)
  }, [])

  const updatePlan = React.useCallback(
    (nextPlan: BuildingOrganizationDraftPlan) => {
      setPlan(nextPlan)
      setServerIssues([])
      onPlanChange?.(nextPlan)
    },
    [onPlanChange],
  )

  const planIssues = React.useMemo(
    () =>
      validateBuildingOrganizationDraftPlan({
        plan,
        existingOrganizations: organizations,
        serverIssues,
      }),
    [organizations, plan, serverIssues],
  )
  const validationIssueCount = planIssues.length + (inProgress ? 1 : 0)
  const visibleIssues = React.useMemo(
    () =>
      validationAttempted && inProgress
        ? [...planIssues, { message: BUILDING_ORGANIZATIONS_IN_PROGRESS_MESSAGE }]
        : planIssues,
    [inProgress, planIssues, validationAttempted],
  )
  const status = React.useMemo<CreateWorkflowPanelStatus>(
    () => ({
      invalid: planIssues.length > 0 || (validationAttempted && inProgress),
      ...(visibleIssues.length > 0 ? { issueCount: visibleIssues.length } : {}),
      dirty: plan.relationships.length > 0 || inProgress,
    }),
    [
      inProgress,
      planIssues.length,
      plan.relationships.length,
      validationAttempted,
      visibleIssues.length,
    ],
  )

  React.useEffect(() => onStatusChange?.(status), [onStatusChange, status])

  React.useEffect(() => {
    if (!controllerRef) return
    controllerRef.current = {
      getPayload: () => plan,
      reset: () => {
        setPlan(EMPTY_BUILDING_ORGANIZATION_DRAFT_PLAN)
        setServerIssues([])
        setValidationAttempted(false)
        setRequestedMode('add')
        resetEditor()
      },
      hydrateServerIssues: (issues) => {
        setServerIssues(issues)
        setValidationAttempted(true)
      },
      validate: async () => {
        setValidationAttempted(true)
        return { valid: validationIssueCount === 0, issueCount: validationIssueCount }
      },
      focusFirstIssue: () => {
        const root = rootRef.current
        const target =
          root?.querySelector<HTMLElement>('[data-organization-draft-issue]') ??
          root?.querySelector<HTMLElement>('input, button, [role="radio"], [role="combobox"]')
        target?.focus()
      },
    }
    return () => {
      controllerRef.current = null
    }
  }, [controllerRef, plan, resetEditor, validationIssueCount])

  const visibleOrganizations = React.useMemo(() => {
    const normalized = searchQuery.trim().toLocaleLowerCase()
    if (!normalized) return organizations
    return organizations.filter((organization) =>
      `${organization.name} ${getOrganizationDomainLabel(organization.organizationDomain)}`
        .toLocaleLowerCase()
        .includes(normalized),
    )
  }, [organizations, searchQuery])

  const kindOptionsFor = React.useCallback(
    (
      organization?: BuildingOrganizationRelationshipDraft['organization'],
      relationshipDraftId?: string,
    ) =>
      buildBuildingOrganizationRelationshipKindOptions({
        plan,
        existingOrganizations: organizations,
        organization,
        relationshipDraftId,
      }),
    [organizations, plan],
  )

  const returnToPending = React.useCallback(() => {
    resetEditor()
    setRequestedMode('pending')
  }, [resetEditor])

  const commitExisting = React.useCallback(
    (organizationId: string) => {
      const options = kindOptionsFor({ kind: 'existing', organizationId })
      const resolvedKind =
        resolveBuildingOrganizationDiscoveryAddState(options).singleEligibleValue ?? kind
      if (!resolvedKind) {
        setValidationAttempted(true)
        return
      }
      updatePlan(
        upsertBuildingOrganizationRelationshipDraft({
          plan,
          relationship: {
            draftId: createBuildingOrganizationDraftId(),
            kind: resolvedKind,
            organization: { kind: 'existing', organizationId },
          },
        }),
      )
      returnToPending()
    },
    [kind, kindOptionsFor, plan, returnToPending, updatePlan],
  )

  const commitNew = React.useCallback(
    (values: OrganizationFormValues) => {
      const draftOrganizationId = newOrganizationDraftId ?? createBuildingOrganizationDraftId()
      const options = kindOptionsFor({ kind: 'new', draftOrganizationId })
      const resolvedKind =
        resolveBuildingOrganizationDiscoveryAddState(options).singleEligibleValue ?? kind
      if (!resolvedKind) {
        setValidationAttempted(true)
        return
      }
      updatePlan(
        upsertBuildingOrganizationRelationshipDraft({
          plan,
          relationship: {
            draftId: createBuildingOrganizationDraftId(),
            kind: resolvedKind,
            organization: { kind: 'new', draftOrganizationId },
          },
          organizationDraft: { draftOrganizationId, values },
        }),
      )
      returnToPending()
    },
    [kind, kindOptionsFor, newOrganizationDraftId, plan, returnToPending, updatePlan],
  )

  const commitPendingEdit = React.useCallback(
    (relationship: BuildingOrganizationRelationshipDraft) => {
      const options = kindOptionsFor(relationship.organization, relationship.draftId)
      const resolvedKind =
        resolveBuildingOrganizationDiscoveryAddState(options).singleEligibleValue ?? kind
      if (!resolvedKind) {
        setValidationAttempted(true)
        return
      }
      updatePlan(
        upsertBuildingOrganizationRelationshipDraft({
          plan,
          relationship: { ...relationship, kind: resolvedKind },
        }),
      )
      setExpandedItemId(null)
      setKind(null)
    },
    [kind, kindOptionsFor, plan, updatePlan],
  )

  const editRelationship = React.useCallback(
    (relationship: BuildingOrganizationRelationshipDraft) => {
      setRequestedMode('pending')
      setNewOrganizationBranch(false)
      setExpandedItemId(buildingOrganizationPendingItemId(relationship.draftId))
      setKind(relationship.kind)
    },
    [],
  )

  const removeRelationship = React.useCallback(
    (relationshipDraftId: string) => {
      const nextPlan = removeBuildingOrganizationRelationshipDraft(plan, relationshipDraftId)
      updatePlan(nextPlan)
      if (parseBuildingOrganizationPendingItemId(expandedItemId ?? '') === relationshipDraftId) {
        setExpandedItemId(null)
        setKind(null)
      }
      if (nextPlan.relationships.length === 0) {
        setRequestedMode('add')
        resetEditor()
      }
    },
    [expandedItemId, plan, resetEditor, updatePlan],
  )

  const handleExpandedItemIdChange = React.useCallback(
    (itemId: string | null) => {
      if (itemId) setValidationAttempted(false)
      setExpandedItemId(itemId)
      const organizationId = itemId ? parseBuildingOrganizationDiscoveryItemId(itemId) : null
      if (organizationId) {
        const addState = resolveBuildingOrganizationDiscoveryAddState(
          kindOptionsFor({ kind: 'existing', organizationId }),
        )
        setKind(addState.singleEligibleValue ?? null)
        return
      }
      const pendingDraftId = itemId ? parseBuildingOrganizationPendingItemId(itemId) : null
      if (pendingDraftId) {
        const relationship = plan.relationships.find((item) => item.draftId === pendingDraftId)
        setKind(relationship?.kind ?? null)
        return
      }
      setKind(null)
    },
    [kindOptionsFor, plan.relationships],
  )

  const enterNewOrganizationBranch = React.useCallback(() => {
    const draftOrganizationId = createBuildingOrganizationDraftId()
    const addState = resolveBuildingOrganizationDiscoveryAddState(
      kindOptionsFor({ kind: 'new', draftOrganizationId }),
    )
    setValidationAttempted(false)
    setNewOrganizationDraftId(draftOrganizationId)
    setNewOrganizationBranch(true)
    setExpandedItemId(null)
    setKind(addState.singleEligibleValue ?? null)
  }, [kindOptionsFor])

  const context: ContentFormCtx = formCtx ?? {
    campaignId,
    mode: 'create',
    entitySource: 'homebrew',
  }

  return {
    rootRef,
    context,
    plan,
    organizations,
    requestedMode,
    setRequestedMode,
    expandedItemId,
    handleExpandedItemIdChange,
    visibleIssues,
    kind,
    setKind,
    searchQuery,
    setSearchQuery,
    isPending,
    isError,
    visibleOrganizations,
    kindOptionsFor,
    newOrganizationBranch,
    newOrganizationDraftId,
    validationAttempted,
    resetEditor,
    commitExisting,
    commitNew,
    commitPendingEdit,
    editRelationship,
    removeRelationship,
    enterNewOrganizationBranch,
    setNewOrganizationBranch,
    setNewOrganizationDraftId,
  }
}
