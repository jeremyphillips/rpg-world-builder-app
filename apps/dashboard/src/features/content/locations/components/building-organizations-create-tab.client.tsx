'use client'

import * as React from 'react'
import {
  getOrganizationDomainLabel,
  getOrganizationLocationConnectionLabel,
  ORGANIZATION_LOCATION_CONNECTION_ENTRIES,
  type Organization,
  type OrganizationLocationConnectionKind,
} from '@rpg/contracts'
import { Alert, Button, Heading, SegmentedControl, SelectField, Text, TextField } from '@rpg/ui'
import { Form } from '@rpg/ui/form'

import type {
  CreateWorkflowDraftPanelController,
  CreateWorkflowPanelStatus,
} from '@/lib/create-flow'

import { useOrganizations } from '../../organizations'
import { CrossContentRelationshipRow } from '../../lib/relationship/cross-content-relationship-row.client'
import {
  buildOrganizationFields,
  buildOrganizationFormValueSyncs,
  organizationCreateDefaultValues,
  organizationFormSchema,
  type OrganizationFormValues,
} from '../../lib/forms/organization-form-projection'
import type { ContentFormCtx } from '../../lib/forms/content-form-registry'
import {
  buildBuildingOrganizationRelationshipKindOptions,
  createBuildingOrganizationDraftId,
  EMPTY_BUILDING_ORGANIZATION_DRAFT_PLAN,
  removeBuildingOrganizationRelationshipDraft,
  upsertBuildingOrganizationRelationshipDraft,
  validateBuildingOrganizationDraftPlan,
  type BuildingOrganizationDraftIssue,
  type BuildingOrganizationDraftPlan,
  type BuildingOrganizationRelationshipDraft,
} from '../lib/building-organization-create-drafts'
import {
  buildingOrganizationsCreateTabClasses,
  buildingOrganizationsEditorActionsClasses,
  buildingOrganizationsEditorClasses,
  buildingOrganizationsIssueListClasses,
  buildingOrganizationsListClasses,
  buildingOrganizationsSearchResultsClasses,
} from './building-organizations-create-tab.variants'

type TargetMode = 'existing' | 'new'

export type BuildingOrganizationsCreateTabController = CreateWorkflowDraftPanelController<
  BuildingOrganizationDraftPlan,
  BuildingOrganizationDraftIssue
>

export type BuildingOrganizationsCreateTabProps = {
  campaignId: string
  formCtx?: ContentFormCtx
  initialPlan?: BuildingOrganizationDraftPlan
  organizationItems?: readonly Organization[]
  controllerRef?: React.MutableRefObject<BuildingOrganizationsCreateTabController | null>
  onStatusChange?: (status: CreateWorkflowPanelStatus) => void
  onPlanChange?: (plan: BuildingOrganizationDraftPlan) => void
}

const TARGET_MODE_OPTIONS = [
  { value: 'existing', label: 'Existing Organization' },
  { value: 'new', label: 'New Organization' },
] as const

function relationshipOrganizationName(input: {
  relationship: BuildingOrganizationRelationshipDraft
  plan: BuildingOrganizationDraftPlan
  existingOrganizations: readonly Organization[]
}): string {
  const target = input.relationship.organization
  if (target.kind === 'existing') {
    return (
      input.existingOrganizations.find((item) => item.id === target.organizationId)?.name ??
      'Unavailable Organization'
    )
  }
  return (
    input.plan.organizations.find((item) => item.draftOrganizationId === target.draftOrganizationId)
      ?.values.name ?? 'New Organization'
  )
}

function editorIssueCount(input: {
  touched: boolean
  kind: OrganizationLocationConnectionKind | null
  targetMode: TargetMode
  selectedOrganizationId: string | null
}): number {
  if (!input.touched) return 0
  let count = input.kind ? 0 : 1
  if (input.targetMode === 'existing' && !input.selectedOrganizationId) count += 1
  if (input.targetMode === 'new') count += 1
  return count
}

type ExistingOrganizationTargetEditorProps = Readonly<{
  isError: boolean
  isPending: boolean
  visibleOrganizations: readonly Organization[]
  searchQuery: string
  selectedOrganizationId: string | null
  editing: boolean
  onSearchChange: (value: string) => void
  onSelectOrganization: (organizationId: string) => void
  onCancelEdit: () => void
  onCommit: () => void
}>

function ExistingOrganizationTargetEditor({
  isError,
  isPending,
  visibleOrganizations,
  searchQuery,
  selectedOrganizationId,
  editing,
  onSearchChange,
  onSelectOrganization,
  onCancelEdit,
  onCommit,
}: ExistingOrganizationTargetEditorProps) {
  return (
    <>
      <TextField
        id="building-organization-search"
        label="Find Organization"
        placeholder="Search Organizations…"
        value={searchQuery}
        onChange={(event) => onSearchChange(event.target.value)}
      />
      {isError ? <Alert variant="destructive" title="Could not load Organizations." /> : null}
      <div className={buildingOrganizationsSearchResultsClasses}>
        {isPending ? <Text variant="muted">Loading Organizations…</Text> : null}
        {!isPending && visibleOrganizations.length === 0 ? (
          <Text variant="muted">No Organizations match this search.</Text>
        ) : null}
        {visibleOrganizations.map((organization) => (
          <Button
            key={organization.id}
            type="button"
            variant={selectedOrganizationId === organization.id ? 'default' : 'outline'}
            onClick={() => onSelectOrganization(organization.id)}
          >
            {organization.name} · {getOrganizationDomainLabel(organization.organizationDomain)}
          </Button>
        ))}
      </div>
      <div className={buildingOrganizationsEditorActionsClasses}>
        {editing ? (
          <Button type="button" variant="ghost" onClick={onCancelEdit}>
            Cancel edit
          </Button>
        ) : null}
        <Button type="button" onClick={onCommit}>
          {editing ? 'Update relationship' : 'Add relationship'}
        </Button>
      </div>
    </>
  )
}

type NewOrganizationTargetEditorProps = Readonly<{
  context: ContentFormCtx
  editingOrganizationDraftId: string | null
  editingOrganizationValues?: OrganizationFormValues
  editing: boolean
  onCancelEdit: () => void
  onCommit: (values: OrganizationFormValues) => void
}>

function NewOrganizationTargetEditor({
  context,
  editingOrganizationDraftId,
  editingOrganizationValues,
  editing,
  onCancelEdit,
  onCommit,
}: NewOrganizationTargetEditorProps) {
  return (
    <Form
      key={editingOrganizationDraftId ?? 'new-organization'}
      id="building-new-organization-draft"
      schema={organizationFormSchema}
      fields={buildOrganizationFields(context, { includeName: true })}
      defaultValues={editingOrganizationValues ?? organizationCreateDefaultValues}
      valueSyncs={buildOrganizationFormValueSyncs()}
      onSubmit={onCommit}
      footer={
        <div className={buildingOrganizationsEditorActionsClasses}>
          {editing ? (
            <Button type="button" variant="ghost" onClick={onCancelEdit}>
              Cancel edit
            </Button>
          ) : null}
          <Button type="submit">{editing ? 'Update relationship' : 'Add relationship'}</Button>
        </div>
      }
    />
  )
}

type BuildingOrganizationEditorProps = Readonly<{
  context: ContentFormCtx
  kind: OrganizationLocationConnectionKind | null
  kindOptions: React.ComponentProps<typeof SelectField>['options']
  targetMode: TargetMode
  validationAttempted: boolean
  editorTouched: boolean
  existingEditor: Omit<ExistingOrganizationTargetEditorProps, 'editing'>
  newEditor: Omit<NewOrganizationTargetEditorProps, 'context' | 'editing'>
  editing: boolean
  onKindChange: (kind: OrganizationLocationConnectionKind) => void
  onTargetModeChange: (mode: TargetMode) => void
}>

function BuildingOrganizationEditor({
  context,
  kind,
  kindOptions,
  targetMode,
  validationAttempted,
  editorTouched,
  existingEditor,
  newEditor,
  editing,
  onKindChange,
  onTargetModeChange,
}: BuildingOrganizationEditorProps) {
  const missingKind = validationAttempted && editorTouched && !kind
  return (
    <div className={buildingOrganizationsEditorClasses}>
      <div>
        <Heading as="h3" variant="subsection">
          {editing ? 'Edit relationship' : 'Add relationship'}
        </Heading>
        <Text variant="muted">Choose how an Organization relates to this Building.</Text>
      </div>
      <SelectField
        id="building-organization-relationship-kind"
        label="Connection type"
        required
        placeholder="Select connection type…"
        options={kindOptions}
        value={kind ?? ''}
        invalid={missingKind}
        error={missingKind ? 'Choose a connection type.' : undefined}
        onValueChange={(value) => onKindChange(value as OrganizationLocationConnectionKind)}
      />
      <SegmentedControl
        aria-label="Organization source"
        fullWidth
        value={targetMode}
        options={TARGET_MODE_OPTIONS}
        onValueChange={onTargetModeChange}
      />
      {targetMode === 'existing' ? (
        <ExistingOrganizationTargetEditor {...existingEditor} editing={editing} />
      ) : (
        <NewOrganizationTargetEditor context={context} {...newEditor} editing={editing} />
      )}
    </div>
  )
}

function BuildingOrganizationDraftIssues({
  issues,
}: {
  issues: readonly BuildingOrganizationDraftIssue[]
}) {
  if (issues.length === 0) return null
  return (
    <Alert variant="destructive" title="Review Organization relationships">
      <ul className={buildingOrganizationsIssueListClasses}>
        {issues.map((issue, index) => (
          <li
            key={`${issue.relationshipDraftId ?? issue.organizationDraftId ?? 'panel'}-${index}`}
            data-organization-draft-issue
            tabIndex={-1}
          >
            {issue.message}
          </li>
        ))}
      </ul>
    </Alert>
  )
}

type PendingRelationshipListProps = Readonly<{
  plan: BuildingOrganizationDraftPlan
  existingOrganizations: readonly Organization[]
  onEdit: (relationship: BuildingOrganizationRelationshipDraft) => void
  onRemove: (relationshipDraftId: string) => void
}>

function PendingRelationshipList({
  plan,
  existingOrganizations,
  onEdit,
  onRemove,
}: PendingRelationshipListProps) {
  return (
    <div className={buildingOrganizationsListClasses}>
      <Heading as="h3" variant="subsection">
        Pending relationships
      </Heading>
      {plan.relationships.length === 0 ? (
        <Text variant="muted">No Organization relationships will be created.</Text>
      ) : (
        plan.relationships.map((relationship) => (
          <CrossContentRelationshipRow
            key={relationship.draftId}
            relationshipEyebrow={getOrganizationLocationConnectionLabel(relationship.kind)}
            heading={relationshipOrganizationName({
              relationship,
              plan,
              existingOrganizations,
            })}
            description={ORGANIZATION_LOCATION_CONNECTION_ENTRIES[relationship.kind].description}
            status={
              relationship.organization.kind === 'new'
                ? { kind: 'badge', label: 'New Organization', tone: 'info' }
                : undefined
            }
            actions={[
              { id: 'edit', label: 'Edit', onSelect: () => onEdit(relationship) },
              {
                id: 'remove',
                label: 'Remove',
                destructive: true,
                onSelect: () => onRemove(relationship.draftId),
              },
            ]}
          />
        ))
      )}
    </div>
  )
}

export function BuildingOrganizationsCreateTab({
  campaignId,
  formCtx,
  initialPlan = EMPTY_BUILDING_ORGANIZATION_DRAFT_PLAN,
  organizationItems,
  controllerRef,
  onStatusChange,
  onPlanChange,
}: BuildingOrganizationsCreateTabProps) {
  const rootRef = React.useRef<HTMLDivElement | null>(null)
  const { data: queriedOrganizations = [], isPending, isError } = useOrganizations(campaignId)
  const organizations = organizationItems ?? queriedOrganizations
  const [plan, setPlan] = React.useState<BuildingOrganizationDraftPlan>(initialPlan)
  const [kind, setKind] = React.useState<OrganizationLocationConnectionKind | null>(null)
  const [targetMode, setTargetMode] = React.useState<TargetMode>('existing')
  const [selectedOrganizationId, setSelectedOrganizationId] = React.useState<string | null>(null)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [editingRelationshipId, setEditingRelationshipId] = React.useState<string | null>(null)
  const [editingOrganizationDraftId, setEditingOrganizationDraftId] = React.useState<string | null>(
    null,
  )
  const [editorTouched, setEditorTouched] = React.useState(false)
  const [validationAttempted, setValidationAttempted] = React.useState(false)
  const [serverIssues, setServerIssues] = React.useState<readonly BuildingOrganizationDraftIssue[]>(
    [],
  )

  const resetEditor = React.useCallback(() => {
    setKind(null)
    setTargetMode('existing')
    setSelectedOrganizationId(null)
    setSearchQuery('')
    setEditingRelationshipId(null)
    setEditingOrganizationDraftId(null)
    setEditorTouched(false)
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
  const incompleteEditorIssues = editorIssueCount({
    touched: editorTouched,
    kind,
    targetMode,
    selectedOrganizationId,
  })
  const issueCount = planIssues.length + incompleteEditorIssues
  const status = React.useMemo<CreateWorkflowPanelStatus>(
    () => ({
      invalid: issueCount > 0,
      ...(issueCount > 0 ? { issueCount } : {}),
      dirty: plan.relationships.length > 0 || editorTouched,
    }),
    [editorTouched, issueCount, plan.relationships.length],
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
        resetEditor()
      },
      hydrateServerIssues: (issues) => {
        setServerIssues(issues)
        setValidationAttempted(true)
      },
      validate: async () => {
        setValidationAttempted(true)
        return { valid: issueCount === 0, issueCount }
      },
      focusFirstIssue: () => {
        const root = rootRef.current
        const target =
          root?.querySelector<HTMLElement>('[data-organization-draft-issue]') ??
          root?.querySelector<HTMLElement>('input, button, [role="combobox"]')
        target?.focus()
      },
    }
    return () => {
      controllerRef.current = null
    }
  }, [controllerRef, issueCount, plan, resetEditor])

  const visibleOrganizations = React.useMemo(() => {
    const normalized = searchQuery.trim().toLocaleLowerCase()
    if (!normalized) return organizations
    return organizations.filter((organization) =>
      `${organization.name} ${getOrganizationDomainLabel(organization.organizationDomain)}`
        .toLocaleLowerCase()
        .includes(normalized),
    )
  }, [organizations, searchQuery])
  const kindOptionTarget = React.useMemo(() => {
    if (targetMode === 'existing' && selectedOrganizationId) {
      return { kind: 'existing', organizationId: selectedOrganizationId } as const
    }
    if (targetMode === 'new' && editingOrganizationDraftId) {
      return { kind: 'new', draftOrganizationId: editingOrganizationDraftId } as const
    }
    return undefined
  }, [editingOrganizationDraftId, selectedOrganizationId, targetMode])
  const kindOptions = React.useMemo(
    () =>
      buildBuildingOrganizationRelationshipKindOptions({
        plan,
        existingOrganizations: organizations,
        organization: kindOptionTarget,
        relationshipDraftId: editingRelationshipId ?? undefined,
      }).map(({ value, label, disabled }) => ({ value, label, disabled })),
    [editingRelationshipId, kindOptionTarget, organizations, plan],
  )

  const commitExisting = () => {
    if (!kind || !selectedOrganizationId) {
      setEditorTouched(true)
      setValidationAttempted(true)
      return
    }
    const relationship: BuildingOrganizationRelationshipDraft = {
      draftId: editingRelationshipId ?? createBuildingOrganizationDraftId(),
      kind,
      organization: { kind: 'existing', organizationId: selectedOrganizationId },
    }
    updatePlan(upsertBuildingOrganizationRelationshipDraft({ plan, relationship }))
    resetEditor()
  }

  const commitNew = (values: OrganizationFormValues) => {
    if (!kind) {
      setEditorTouched(true)
      setValidationAttempted(true)
      return
    }
    const draftOrganizationId = editingOrganizationDraftId ?? createBuildingOrganizationDraftId()
    const relationship: BuildingOrganizationRelationshipDraft = {
      draftId: editingRelationshipId ?? createBuildingOrganizationDraftId(),
      kind,
      organization: { kind: 'new', draftOrganizationId },
    }
    updatePlan(
      upsertBuildingOrganizationRelationshipDraft({
        plan,
        relationship,
        organizationDraft: { draftOrganizationId, values },
      }),
    )
    resetEditor()
  }

  const editRelationship = (relationship: BuildingOrganizationRelationshipDraft) => {
    setEditingRelationshipId(relationship.draftId)
    setKind(relationship.kind)
    setEditorTouched(true)
    if (relationship.organization.kind === 'existing') {
      setTargetMode('existing')
      setSelectedOrganizationId(relationship.organization.organizationId)
      setEditingOrganizationDraftId(null)
    } else {
      setTargetMode('new')
      setSelectedOrganizationId(null)
      setEditingOrganizationDraftId(relationship.organization.draftOrganizationId)
    }
  }

  const editingOrganizationValues = editingOrganizationDraftId
    ? plan.organizations.find((draft) => draft.draftOrganizationId === editingOrganizationDraftId)
        ?.values
    : undefined
  const context: ContentFormCtx = formCtx ?? {
    campaignId,
    mode: 'create',
    entitySource: 'homebrew',
  }

  return (
    <div ref={rootRef} className={buildingOrganizationsCreateTabClasses}>
      <BuildingOrganizationEditor
        context={context}
        kind={kind}
        kindOptions={kindOptions}
        targetMode={targetMode}
        validationAttempted={validationAttempted}
        editorTouched={editorTouched}
        editing={editingRelationshipId != null}
        onKindChange={(nextKind) => {
          setKind(nextKind)
          setEditorTouched(true)
          setServerIssues([])
        }}
        onTargetModeChange={(nextMode) => {
          setTargetMode(nextMode)
          setEditorTouched(true)
          setServerIssues([])
        }}
        existingEditor={{
          isError,
          isPending,
          visibleOrganizations,
          searchQuery,
          selectedOrganizationId,
          onSearchChange: (value) => {
            setSearchQuery(value)
            setEditorTouched(true)
          },
          onSelectOrganization: (organizationId) => {
            setSelectedOrganizationId(organizationId)
            setEditorTouched(true)
            setServerIssues([])
          },
          onCancelEdit: resetEditor,
          onCommit: commitExisting,
        }}
        newEditor={{
          editingOrganizationDraftId,
          editingOrganizationValues,
          onCancelEdit: resetEditor,
          onCommit: commitNew,
        }}
      />
      <BuildingOrganizationDraftIssues issues={planIssues} />
      <PendingRelationshipList
        plan={plan}
        existingOrganizations={organizations}
        onEdit={editRelationship}
        onRemove={(relationshipDraftId) =>
          updatePlan(removeBuildingOrganizationRelationshipDraft(plan, relationshipDraftId))
        }
      />
    </div>
  )
}
