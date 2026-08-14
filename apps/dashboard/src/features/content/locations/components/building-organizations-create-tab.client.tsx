'use client'

import * as React from 'react'
import { type Organization } from '@rpg/contracts'
import { Alert } from '@rpg/ui'

import {
  AddPendingWorkflow,
  type AddPendingWorkflowMode,
  type CreateWorkflowDraftPanelController,
  type CreateWorkflowPanelStatus,
} from '@/lib/create-flow'

import { ContentEntityCard } from '../../lib/content-entity-card.client'
import { DetailOverflowMenu } from '../../lib/detail/row/detail-overflow-menu.client'
import type { ContentFormCtx } from '../../lib/forms/content-form-registry'
import type {
  BuildingOrganizationDraftIssue,
  BuildingOrganizationDraftPlan,
} from '../lib/building-organization-create-drafts'
import {
  BUILDING_ORGANIZATIONS_ADD_ANOTHER_LABEL,
  BUILDING_ORGANIZATIONS_EDIT_ACTION_LABEL,
  BUILDING_ORGANIZATIONS_OVERFLOW_LABEL,
  BUILDING_ORGANIZATIONS_PENDING_HEADING,
  BUILDING_ORGANIZATIONS_REMOVE_ACTION_LABEL,
  buildBuildingOrganizationPendingEntity,
} from '../lib/building-organizations-create-tab.lib'
import { useBuildingOrganizationsCreateTab } from '../hooks/use-building-organizations-create-tab.client'
import {
  BuildingOrganizationComposer,
  BuildingOrganizationPendingEdit,
} from './building-organizations-composer.client'
import {
  buildingOrganizationsCreateTabClasses,
  buildingOrganizationsIssueListClasses,
} from './building-organizations-create-tab.variants'

export type { BuildingOrganizationComposerStage } from '../lib/building-organizations-create-tab-controller.lib'

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
  const controller = useBuildingOrganizationsCreateTab(props)
  const {
    rootRef,
    plan,
    organizations,
    requestedMode,
    setRequestedMode,
    editingDraftId,
    visibleIssues,
    resetEditor,
    editRelationship,
    removeRelationship,
  } = controller

  return (
    <div ref={rootRef} className={buildingOrganizationsCreateTabClasses}>
      <BuildingOrganizationDraftIssues issues={visibleIssues} />
      <AddPendingWorkflow
        hasPendingItems={plan.relationships.length > 0}
        mode={requestedMode}
        onModeChange={setRequestedMode}
        addAnotherLabel={BUILDING_ORGANIZATIONS_ADD_ANOTHER_LABEL}
        onAddAnother={resetEditor}
        pendingHeading={BUILDING_ORGANIZATIONS_PENDING_HEADING}
        pendingItems={plan.relationships.map((relationship) =>
          editingDraftId === relationship.draftId ? (
            <BuildingOrganizationPendingEdit
              key={relationship.draftId}
              controller={controller}
              relationship={relationship}
            />
          ) : (
            <ContentEntityCard
              key={relationship.draftId}
              entity={buildBuildingOrganizationPendingEntity({
                relationship,
                plan,
                existingOrganizations: organizations,
              })}
              density="compact"
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
            />
          ),
        )}
        composing={
          <div data-building-organization-composer>
            <BuildingOrganizationComposer controller={controller} />
          </div>
        }
      />
    </div>
  )
}
