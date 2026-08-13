'use client'

import * as React from 'react'
import { type Organization, type OrganizationLocationConnectionKind } from '@rpg/contracts'
import { Alert, Button, Text, TextField } from '@rpg/ui'
import { Form } from '@rpg/ui/form'

import {
  AddPendingWorkflow,
  DisclosureChoiceComposer,
  type AddPendingWorkflowMode,
  type CreateWorkflowDraftPanelController,
  type CreateWorkflowPanelStatus,
} from '@/lib/create-flow'

import { AddPendingDisclosureCard } from '../../lib/entity/add-pending-disclosure-card.client'
import { buildOrganizationPickerEntitySummary } from '../../lib/content-entity-picker-presentation.lib'
import { DetailOverflowMenu } from '../../lib/detail/row/detail-overflow-menu.client'
import {
  buildOrganizationFields,
  buildOrganizationFormValueSyncs,
  organizationCreateDefaultValues,
  organizationFormSchema,
} from '../../lib/forms/organization-form-projection'
import type { ContentFormCtx } from '../../lib/forms/content-form-registry'
import {
  resolveBuildingOrganizationDiscoveryAddState,
  type BuildingOrganizationDraftIssue,
  type BuildingOrganizationDraftPlan,
} from '../lib/building-organization-create-drafts'
import {
  BUILDING_ORGANIZATIONS_ADD_ANOTHER_LABEL,
  BUILDING_ORGANIZATIONS_ADD_DESCRIPTION,
  BUILDING_ORGANIZATIONS_ADD_RELATIONSHIP_LABEL,
  BUILDING_ORGANIZATIONS_CHOOSE_EXISTING_LABEL,
  BUILDING_ORGANIZATIONS_CREATE_NEW_LABEL,
  BUILDING_ORGANIZATIONS_EDIT_ACTION_LABEL,
  BUILDING_ORGANIZATIONS_EMPTY_SEARCH_LABEL,
  BUILDING_ORGANIZATIONS_LOAD_ERROR_TITLE,
  BUILDING_ORGANIZATIONS_LOADING_LABEL,
  BUILDING_ORGANIZATIONS_OVERFLOW_LABEL,
  BUILDING_ORGANIZATIONS_PENDING_HEADING,
  BUILDING_ORGANIZATIONS_REMOVE_ACTION_LABEL,
  BUILDING_ORGANIZATIONS_SEARCH_LABEL,
  BUILDING_ORGANIZATIONS_SEARCH_PLACEHOLDER,
  BUILDING_ORGANIZATIONS_UPDATE_RELATIONSHIP_LABEL,
  buildBuildingOrganizationPendingEntity,
  buildingOrganizationDiscoveryItemId,
  buildingOrganizationPendingItemId,
} from '../lib/building-organizations-create-tab.lib'
import { useBuildingOrganizationsCreateTab } from '../hooks/use-building-organizations-create-tab.client'
import {
  buildingOrganizationsCreateTabClasses,
  buildingOrganizationsIssueListClasses,
} from './building-organizations-create-tab.variants'

export type BuildingOrganizationsCreateTabController = CreateWorkflowDraftPanelController<
  BuildingOrganizationDraftPlan,
  BuildingOrganizationDraftIssue
>

export type BuildingOrganizationsCreateTabProps = {
  campaignId: string
  formCtx?: ContentFormCtx
  initialPlan?: BuildingOrganizationDraftPlan
  initialMode?: AddPendingWorkflowMode
  organizationItems?: readonly Organization[]
  controllerRef?: React.MutableRefObject<BuildingOrganizationsCreateTabController | null>
  onStatusChange?: (status: CreateWorkflowPanelStatus) => void
  onPlanChange?: (plan: BuildingOrganizationDraftPlan) => void
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

export function BuildingOrganizationsCreateTab(props: BuildingOrganizationsCreateTabProps) {
  const {
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
  } = useBuildingOrganizationsCreateTab(props)

  return (
    <div ref={rootRef} className={buildingOrganizationsCreateTabClasses}>
      <BuildingOrganizationDraftIssues issues={visibleIssues} />
      <AddPendingWorkflow
        hasPendingItems={plan.relationships.length > 0}
        mode={requestedMode}
        onModeChange={setRequestedMode}
        expandedItemId={expandedItemId}
        onExpandedItemIdChange={handleExpandedItemIdChange}
        addAnotherLabel={BUILDING_ORGANIZATIONS_ADD_ANOTHER_LABEL}
        onAddAnother={resetEditor}
        pendingHeading={BUILDING_ORGANIZATIONS_PENDING_HEADING}
        pendingItems={plan.relationships.map((relationship) => (
          <AddPendingDisclosureCard
            key={relationship.draftId}
            itemId={buildingOrganizationPendingItemId(relationship.draftId)}
            entity={buildBuildingOrganizationPendingEntity({
              relationship,
              plan,
              existingOrganizations: organizations,
            })}
            trailing={{
              kind: 'action',
              content: (
                <DetailOverflowMenu
                  triggerLabel={BUILDING_ORGANIZATIONS_OVERFLOW_LABEL}
                  actions={[
                    {
                      id: 'edit',
                      label: BUILDING_ORGANIZATIONS_EDIT_ACTION_LABEL,
                      onSelect: () => editRelationship(relationship),
                    },
                    {
                      id: 'remove',
                      label: BUILDING_ORGANIZATIONS_REMOVE_ACTION_LABEL,
                      destructive: true,
                      onSelect: () => removeRelationship(relationship.draftId),
                    },
                  ]}
                />
              ),
            }}
          >
            <DisclosureChoiceComposer
              id={`building-organization-pending-kind-${relationship.draftId}`}
              choices={kindOptionsFor(relationship.organization, relationship.draftId)}
              value={kind}
              onValueChange={(value) => setKind(value as OrganizationLocationConnectionKind)}
              confirmLabel={BUILDING_ORGANIZATIONS_UPDATE_RELATIONSHIP_LABEL}
              onConfirm={() => commitPendingEdit(relationship)}
            />
          </AddPendingDisclosureCard>
        ))}
        addDescription={<Text variant="muted">{BUILDING_ORGANIZATIONS_ADD_DESCRIPTION}</Text>}
        addSearch={
          <TextField
            id="building-organization-search"
            label={BUILDING_ORGANIZATIONS_SEARCH_LABEL}
            placeholder={BUILDING_ORGANIZATIONS_SEARCH_PLACEHOLDER}
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        }
        addDiscovery={
          <>
            {isError ? (
              <Alert variant="destructive" title={BUILDING_ORGANIZATIONS_LOAD_ERROR_TITLE} />
            ) : null}
            {isPending ? <Text variant="muted">{BUILDING_ORGANIZATIONS_LOADING_LABEL}</Text> : null}
            {!isPending && visibleOrganizations.length === 0 ? (
              <Text variant="muted">{BUILDING_ORGANIZATIONS_EMPTY_SEARCH_LABEL}</Text>
            ) : null}
            {visibleOrganizations.map((organization) => {
              const options = kindOptionsFor({
                kind: 'existing',
                organizationId: organization.id,
              })
              const addState = resolveBuildingOrganizationDiscoveryAddState(options)
              return (
                <AddPendingDisclosureCard
                  key={organization.id}
                  itemId={buildingOrganizationDiscoveryItemId(organization.id)}
                  entity={buildOrganizationPickerEntitySummary(organization)}
                  addDisabled={addState.addDisabled}
                  addDisabledReason={addState.addDisabledReason}
                >
                  <DisclosureChoiceComposer
                    id={`building-organization-kind-${organization.id}`}
                    choices={options}
                    value={kind}
                    onValueChange={(value) => setKind(value as OrganizationLocationConnectionKind)}
                    confirmLabel={BUILDING_ORGANIZATIONS_ADD_RELATIONSHIP_LABEL}
                    onConfirm={() => commitExisting(organization.id)}
                  />
                </AddPendingDisclosureCard>
              )
            })}
          </>
        }
        addAlternateAction={
          <Button type="button" variant="ghost" onClick={enterNewOrganizationBranch}>
            {BUILDING_ORGANIZATIONS_CREATE_NEW_LABEL}
          </Button>
        }
        addBranch={
          newOrganizationBranch ? (
            <Form
              key={newOrganizationDraftId ?? 'new-organization'}
              id="building-new-organization-draft"
              schema={organizationFormSchema}
              fields={buildOrganizationFields(context, { includeName: true })}
              defaultValues={organizationCreateDefaultValues}
              valueSyncs={buildOrganizationFormValueSyncs()}
              onSubmit={commitNew}
              footer={
                <DisclosureChoiceComposer
                  id="building-new-organization-kind"
                  choices={kindOptionsFor(
                    newOrganizationDraftId
                      ? { kind: 'new', draftOrganizationId: newOrganizationDraftId }
                      : undefined,
                  )}
                  value={kind}
                  onValueChange={(value) => setKind(value as OrganizationLocationConnectionKind)}
                  confirmLabel={BUILDING_ORGANIZATIONS_ADD_RELATIONSHIP_LABEL}
                  confirmType="submit"
                  confirmDisabled={validationAttempted && !kind}
                />
              }
            />
          ) : undefined
        }
        addBranchBackLabel={BUILDING_ORGANIZATIONS_CHOOSE_EXISTING_LABEL}
        onAddBranchBack={() => {
          setNewOrganizationBranch(false)
          setNewOrganizationDraftId(null)
          setKind(null)
        }}
      />
    </div>
  )
}
