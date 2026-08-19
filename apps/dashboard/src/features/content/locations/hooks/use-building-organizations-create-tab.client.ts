'use client'

import * as React from 'react'
import {
  getOrganizationDomainLabel,
  getOrganizationLocationConnectionLabel,
  type Organization,
} from '@rpg/contracts'

import type {
  AddPendingWorkflowMode,
  CreateWorkflowDraftPanelController,
  CreateWorkflowPanelStatus,
} from '@/lib/create-flow'

import { useOrganizations } from '../../organizations'
import type { ContentFormCtx } from '../../lib/forms/content-form-registry'
import { filterReferenceableCatalogRows } from '../../lib/form-options/content-reference-catalog.lib'
import type { OrganizationFormValues } from '../../lib/forms/organization-form-projection'
import {
  buildBuildingOrganizationRelationshipKindOptions,
  createBuildingOrganizationDraftId,
  EMPTY_BUILDING_ORGANIZATION_DRAFT_PLAN,
  removeBuildingOrganizationRelationshipDraft,
  resolveBuildingOrganizationDiscoveryAddState,
  resolveBuildingOrganizationSelectState,
  validateBuildingOrganizationDraftPlan,
  type BuildingOrganizationDraftIssue,
  type BuildingOrganizationDraftPlan,
  type BuildingOrganizationRelationshipDraft,
} from '../lib/building-organization-create-drafts'
import {
  buildExistingOrganizationCommitPlan,
  buildNewOrganizationCommitPlan,
  buildPendingOrganizationCommitPlan,
  createBuildingOrganizationPanelController,
  filterVisibleOrganizations,
  organizationTargetEligibleForKind,
  resolveBuildingOrganizationCommitKind,
  resolveBuildingOrganizationComposerStage,
  resolveBuildingOrganizationComposerView,
  resolveBuildingOrganizationEffectiveKind,
  resolveBuildingOrganizationHasResolvedOrganizationTarget,
  resolveBuildingOrganizationInProgress,
  resolveBuildingOrganizationVisibleIssues,
  type BuildingOrganizationComposerStage,
  type BuildingOrganizationComposerTarget,
  type BuildingOrganizationEditingDecision,
} from '../lib/building-organizations-create-tab-controller.lib'
import { resolveBuildingOrganizationTargetName } from '../lib/building-organizations-create-tab.lib'

export type {
  BuildingOrganizationComposerStage,
  BuildingOrganizationComposerTarget,
  BuildingOrganizationEditingDecision,
}

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
  const organizations = React.useMemo(() => {
    const source = organizationItems ?? queriedOrganizations
    return filterReferenceableCatalogRows(source)
  }, [organizationItems, queriedOrganizations])
  const [plan, setPlan] = React.useState<BuildingOrganizationDraftPlan>(initialPlan)
  const [requestedMode, setRequestedMode] = React.useState<AddPendingWorkflowMode>(
    initialMode ?? (initialPlan.relationships.length > 0 ? 'pending' : 'add'),
  )
  const [composerStage, setComposerStage] =
    React.useState<BuildingOrganizationComposerStage>('intent')
  const [editingDraftId, setEditingDraftId] = React.useState<string | null>(null)
  const [selectedOrganization, setSelectedOrganization] =
    React.useState<BuildingOrganizationComposerTarget | null>(null)
  const [newOrganizationDraftId, setNewOrganizationDraftId] = React.useState<string | null>(null)
  const [kind, setKind] = React.useState<BuildingOrganizationRelationshipDraft['kind'] | null>(null)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [validationAttempted, setValidationAttempted] = React.useState(false)
  const [serverIssues, setServerIssues] = React.useState<readonly BuildingOrganizationDraftIssue[]>(
    [],
  )
  const [editingDecision, setEditingDecision] =
    React.useState<BuildingOrganizationEditingDecision | null>(null)

  const resetEditor = React.useCallback(() => {
    setComposerStage('intent')
    setEditingDraftId(null)
    setSelectedOrganization(null)
    setNewOrganizationDraftId(null)
    setKind(null)
    setSearchQuery('')
    setEditingDecision(null)
  }, [])

  const updatePlan = React.useCallback(
    (nextPlan: BuildingOrganizationDraftPlan) => {
      setPlan(nextPlan)
      setServerIssues([])
      onPlanChange?.(nextPlan)
    },
    [onPlanChange],
  )

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

  const intentKindOptions = React.useMemo(() => kindOptionsFor(), [kindOptionsFor])
  const intentState = React.useMemo(
    () => resolveBuildingOrganizationDiscoveryAddState(intentKindOptions),
    [intentKindOptions],
  )
  const effectiveKind = resolveBuildingOrganizationEffectiveKind({
    kind,
    requestedMode,
    composerStage,
    editingDraftId,
    intentState,
  })
  const resolvedComposerStage = resolveBuildingOrganizationComposerStage({
    composerStage,
    effectiveKind,
    kind,
    intentState,
  })
  const inProgress = resolveBuildingOrganizationInProgress({
    editingDraftId,
    requestedMode,
    composerStage: resolvedComposerStage,
    effectiveKind,
  })

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
      resolveBuildingOrganizationVisibleIssues({
        validationAttempted,
        inProgress,
        planIssues,
      }),
    [inProgress, planIssues, validationAttempted],
  )
  const status = React.useMemo<CreateWorkflowPanelStatus>(
    () => ({
      invalid: planIssues.length > 0 || (validationAttempted && inProgress),
      blocksSubmit: validationIssueCount > 0,
      ...(visibleIssues.length > 0 ? { issueCount: visibleIssues.length } : {}),
      dirty: plan.relationships.length > 0 || inProgress,
    }),
    [
      inProgress,
      planIssues.length,
      plan.relationships.length,
      validationAttempted,
      validationIssueCount,
      visibleIssues.length,
    ],
  )

  React.useEffect(() => onStatusChange?.(status), [onStatusChange, status])

  const focusFirstIssue = React.useCallback(() => {
    const root = rootRef.current
    const target =
      root?.querySelector<HTMLElement>('[data-organization-draft-issue]') ??
      root?.querySelector<HTMLElement>(
        '[data-building-organization-composer] input, [data-building-organization-composer] button, [data-building-organization-composer] [role="radio"]',
      )
    target?.focus()
  }, [])

  const hydrateServerIssues = React.useCallback(
    (issues: readonly BuildingOrganizationDraftIssue[]) => {
      setServerIssues(issues)
      setValidationAttempted(true)
    },
    [],
  )

  const panelReset = React.useCallback(() => {
    setPlan(EMPTY_BUILDING_ORGANIZATION_DRAFT_PLAN)
    setServerIssues([])
    setValidationAttempted(false)
    setRequestedMode('add')
    resetEditor()
  }, [resetEditor])

  React.useEffect(() => {
    if (!controllerRef) return
    const controller = createBuildingOrganizationPanelController({
      plan,
      reset: panelReset,
      validationIssueCount,
      focusFirstIssue,
      hydrateServerIssues,
    })
    controllerRef.current = {
      ...controller,
      validate: async () => {
        setValidationAttempted(true)
        return controller.validate()
      },
    }
    return () => {
      controllerRef.current = null
    }
  }, [controllerRef, focusFirstIssue, hydrateServerIssues, panelReset, plan, validationIssueCount])

  const visibleOrganizations = React.useMemo(
    () =>
      filterVisibleOrganizations(organizations, searchQuery, (organization) =>
        getOrganizationDomainLabel(organization.organizationDomain),
      ),
    [organizations, searchQuery],
  )

  const returnToPending = React.useCallback(() => {
    resetEditor()
    setRequestedMode('pending')
  }, [resetEditor])

  const handleKindChange = React.useCallback(
    (value: BuildingOrganizationRelationshipDraft['kind']) => {
      if (value === kind) {
        setEditingDecision(null)
        return
      }
      setValidationAttempted(false)
      setEditingDecision(null)
      setKind(value)
      if (!selectedOrganization) {
        setComposerStage('discovery')
        return
      }
      const stillEligible = organizationTargetEligibleForKind({
        kind: value,
        organization: selectedOrganization,
        kindOptionsFor,
        relationshipDraftId: editingDraftId ?? undefined,
      })
      setComposerStage(stillEligible ? 'review' : 'discovery')
      if (!stillEligible) setSelectedOrganization(null)
    },
    [editingDraftId, kind, kindOptionsFor, selectedOrganization],
  )

  const startEditingRelationship = React.useCallback(() => {
    setEditingDecision('relationship')
  }, [])

  const startEditingOrganization = React.useCallback(() => {
    setEditingDecision('organization')
  }, [])

  const selectExistingOrganization = React.useCallback(
    (organizationId: string) => {
      if (
        editingDecision === 'organization' &&
        selectedOrganization?.kind === 'existing' &&
        selectedOrganization.organizationId === organizationId
      ) {
        setEditingDecision(null)
        return
      }

      setValidationAttempted(false)
      setEditingDecision(null)
      setSelectedOrganization({ kind: 'existing', organizationId })
      setComposerStage('review')
    },
    [editingDecision, selectedOrganization],
  )

  const commitExisting = React.useCallback(() => {
    const resolvedKind = resolveBuildingOrganizationCommitKind({
      kind,
      singleEligibleValue: intentState.singleEligibleValue,
    })
    if (!resolvedKind || !selectedOrganization || selectedOrganization.kind !== 'existing') {
      setValidationAttempted(true)
      return
    }
    updatePlan(
      buildExistingOrganizationCommitPlan({
        plan,
        kind: resolvedKind,
        organizationId: selectedOrganization.organizationId,
      }),
    )
    returnToPending()
  }, [
    intentState.singleEligibleValue,
    kind,
    plan,
    returnToPending,
    selectedOrganization,
    updatePlan,
  ])

  const commitNew = React.useCallback(
    (values: OrganizationFormValues) => {
      const draftOrganizationId = newOrganizationDraftId ?? createBuildingOrganizationDraftId()
      const resolvedKind = resolveBuildingOrganizationCommitKind({
        kind,
        singleEligibleValue: intentState.singleEligibleValue,
      })
      if (!resolvedKind) {
        setValidationAttempted(true)
        return
      }
      updatePlan(
        buildNewOrganizationCommitPlan({
          plan,
          kind: resolvedKind,
          draftOrganizationId,
          values,
        }),
      )
      returnToPending()
    },
    [
      intentState.singleEligibleValue,
      kind,
      newOrganizationDraftId,
      plan,
      returnToPending,
      updatePlan,
    ],
  )

  const commitPendingEdit = React.useCallback(
    (relationship: BuildingOrganizationRelationshipDraft) => {
      if (!kind || !selectedOrganization) {
        setValidationAttempted(true)
        return
      }
      updatePlan(
        buildPendingOrganizationCommitPlan({
          plan,
          relationship,
          kind,
          organization: selectedOrganization,
        }),
      )
      setEditingDraftId(null)
      setSelectedOrganization(null)
      setKind(null)
      setComposerStage('intent')
      setEditingDecision(null)
    },
    [kind, plan, selectedOrganization, updatePlan],
  )

  const editRelationship = React.useCallback(
    (relationship: BuildingOrganizationRelationshipDraft) => {
      setValidationAttempted(false)
      setEditingDraftId(relationship.draftId)
      setSelectedOrganization(relationship.organization)
      setKind(relationship.kind)
      setComposerStage('review')
      setNewOrganizationDraftId(null)
      setEditingDecision(null)
    },
    [],
  )

  const cancelPendingEdit = React.useCallback(() => {
    setEditingDraftId(null)
    setSelectedOrganization(null)
    setKind(null)
    setComposerStage('intent')
    setEditingDecision(null)
  }, [])

  const removeRelationship = React.useCallback(
    (relationshipDraftId: string) => {
      const nextPlan = removeBuildingOrganizationRelationshipDraft(plan, relationshipDraftId)
      updatePlan(nextPlan)
      if (editingDraftId === relationshipDraftId) cancelPendingEdit()
      if (nextPlan.relationships.length === 0) {
        setRequestedMode('add')
        resetEditor()
      }
    },
    [cancelPendingEdit, editingDraftId, plan, resetEditor, updatePlan],
  )

  const enterNewOrganizationBranch = React.useCallback(() => {
    const draftOrganizationId = createBuildingOrganizationDraftId()
    setValidationAttempted(false)
    setEditingDecision(null)
    setNewOrganizationDraftId(draftOrganizationId)
    setSelectedOrganization({ kind: 'new', draftOrganizationId })
    setComposerStage('branch')
  }, [])

  const returnToDiscovery = React.useCallback(() => {
    setValidationAttempted(false)
    setEditingDecision(null)
    setSelectedOrganization(null)
    setNewOrganizationDraftId(null)
    setComposerStage('discovery')
  }, [])

  const composerKindOptions = React.useMemo(() => {
    if (editingDraftId && selectedOrganization) {
      return kindOptionsFor(selectedOrganization, editingDraftId)
    }
    return intentKindOptions
  }, [editingDraftId, intentKindOptions, kindOptionsFor, selectedOrganization])

  const organizationName = React.useMemo(
    () =>
      selectedOrganization
        ? resolveBuildingOrganizationTargetName({
            organization: selectedOrganization,
            plan,
            existingOrganizations: organizations,
          })
        : null,
    [organizations, plan, selectedOrganization],
  )

  const composerView = React.useMemo(
    () =>
      resolveBuildingOrganizationComposerView({
        composerStage: resolvedComposerStage,
        editingDecision,
        kindLabel: effectiveKind ? getOrganizationLocationConnectionLabel(effectiveKind) : null,
        organizationName,
        hasKind: effectiveKind != null,
        hasResolvedOrganization: resolveBuildingOrganizationHasResolvedOrganizationTarget({
          selectedOrganization,
          organizationName,
        }),
        relationshipKindCount: composerKindOptions.filter((option) => !option.disabled).length,
      }),
    [
      composerKindOptions,
      editingDecision,
      effectiveKind,
      organizationName,
      resolvedComposerStage,
      selectedOrganization,
    ],
  )

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
    composerStage: resolvedComposerStage,
    setComposerStage,
    editingDraftId,
    editingDecision,
    selectedOrganization,
    visibleIssues,
    kind: effectiveKind,
    rawKind: kind,
    handleKindChange,
    startEditingRelationship,
    startEditingOrganization,
    composerView,
    searchQuery,
    setSearchQuery,
    isPending,
    isError,
    visibleOrganizations,
    kindOptionsFor,
    intentKindOptions,
    intentState,
    newOrganizationDraftId,
    validationAttempted,
    resetEditor,
    selectExistingOrganization,
    commitExisting,
    commitNew,
    commitPendingEdit,
    editRelationship,
    cancelPendingEdit,
    removeRelationship,
    enterNewOrganizationBranch,
    returnToDiscovery,
    resolveBuildingOrganizationSelectState,
  }
}

export type UseBuildingOrganizationsCreateTabResult = ReturnType<
  typeof useBuildingOrganizationsCreateTab
>
