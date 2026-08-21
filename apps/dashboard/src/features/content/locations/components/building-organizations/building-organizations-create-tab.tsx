import * as React from 'react'
import { type Organization } from '@rpg/contracts'
import { Alert, Heading, Text } from '@rpg/ui'

import {
  AddPendingWorkflow,
  type CreateCompositionChildWorkflowView,
  type CreateWorkflowPanelStatus,
} from '@/lib/create-flow'

import { ContentEntityCard } from '@/features/content'
import { DetailOverflowMenu } from '../../../lib/detail/detail-overflow-menu'
import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import type {
  BuildingOrganizationDraftIssue,
  BuildingOrganizationDraftPlan,
} from '../../lib/building-organizations/building-organization-create-drafts'
import type { BuildingOrganizationComposerMode } from '../../lib/building-organizations/building-organizations-create-tab-controller.lib'
import {
  BUILDING_ORGANIZATIONS_ADD_ANOTHER_LABEL,
  BUILDING_ORGANIZATIONS_ADD_FIRST_LABEL,
  BUILDING_ORGANIZATIONS_EDIT_ACTION_LABEL,
  BUILDING_ORGANIZATIONS_EMPTY_STATE_LABEL,
  BUILDING_ORGANIZATIONS_OVERFLOW_LABEL,
  BUILDING_ORGANIZATIONS_PENDING_HEADING,
  BUILDING_ORGANIZATIONS_REMOVE_ACTION_LABEL,
  BUILDING_ORGANIZATIONS_TAB_DESCRIPTION,
  BUILDING_ORGANIZATIONS_TAB_HEADING,
  buildBuildingOrganizationPendingEntity,
} from '../../lib/building-organizations/building-organizations-create-tab.lib'
import { useBuildingOrganizationsCreateTab } from '../../hooks/use-building-organizations-create-tab'
import type { BuildingOrganizationsCreateTabController } from '../../hooks/use-building-organizations-create-tab'
import { BuildingOrganizationComposer } from './building-organizations-composer'
import {
  buildingOrganizationsCreateTabClasses,
  buildingOrganizationsIssueListClasses,
  buildingOrganizationsTabIntroClasses,
} from './building-organizations-create-tab.variants'

export type { BuildingOrganizationComposerStage } from '../../lib/building-organizations/building-organizations-create-tab-controller.lib'

export type { BuildingOrganizationsCreateTabController } from '../../hooks/use-building-organizations-create-tab'

export type BuildingOrganizationsCreateTabProps = {
  campaignId: string
  formCtx?: ContentFormCtx
  initialPlan?: BuildingOrganizationDraftPlan
  initialComposerMode?: BuildingOrganizationComposerMode
  organizationItems?: readonly Organization[]
  controllerRef?: React.MutableRefObject<BuildingOrganizationsCreateTabController | null>
  onStatusChange?: (status: CreateWorkflowPanelStatus) => void
  onPlanChange?: (plan: BuildingOrganizationDraftPlan) => void
  onChildWorkflowChange?: (view: CreateCompositionChildWorkflowView) => void
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

function BuildingOrganizationsTabIntro() {
  return (
    <div className={buildingOrganizationsTabIntroClasses}>
      <Heading as="h2" variant="subsection">
        {BUILDING_ORGANIZATIONS_TAB_HEADING}
      </Heading>
      <Text variant="muted">{BUILDING_ORGANIZATIONS_TAB_DESCRIPTION}</Text>
    </div>
  )
}

export function BuildingOrganizationsCreateTab(props: BuildingOrganizationsCreateTabProps) {
  const controller = useBuildingOrganizationsCreateTab(props)
  const {
    rootRef,
    plan,
    organizations,
    composerMode,
    addPendingWorkflowMode,
    handleAddPendingWorkflowModeChange,
    startComposing,
    visibleIssues,
    editRelationship,
    removeRelationship,
  } = controller

  return (
    <div ref={rootRef} className={buildingOrganizationsCreateTabClasses}>
      <BuildingOrganizationDraftIssues issues={visibleIssues} />
      {composerMode === 'resting' ? <BuildingOrganizationsTabIntro /> : null}
      <AddPendingWorkflow
        hasPendingItems={plan.relationships.length > 0}
        mode={addPendingWorkflowMode}
        onModeChange={handleAddPendingWorkflowModeChange}
        addFirstLabel={BUILDING_ORGANIZATIONS_ADD_FIRST_LABEL}
        addAnotherLabel={BUILDING_ORGANIZATIONS_ADD_ANOTHER_LABEL}
        onAddAnother={startComposing}
        pendingHeading={BUILDING_ORGANIZATIONS_PENDING_HEADING}
        emptyState={<Text variant="muted">{BUILDING_ORGANIZATIONS_EMPTY_STATE_LABEL}</Text>}
        pendingItems={plan.relationships.map((relationship) => (
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
        ))}
        composing={
          <div data-building-organization-composer>
            <BuildingOrganizationComposer controller={controller} />
          </div>
        }
      />
    </div>
  )
}
