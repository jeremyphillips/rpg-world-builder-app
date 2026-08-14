'use client'

import { type OrganizationLocationConnectionKind } from '@rpg/contracts'
import { Alert, Button, ChooserSummaryCard, SearchBar, Text } from '@rpg/ui'
import { Form } from '@rpg/ui/form'

import { LocationConnectionKindStep } from '../../components/location-connection-kind-step.client'
import { ContentEntityCard } from '../../lib/content-entity-card.client'
import { buildOrganizationPickerEntitySummary } from '../../lib/content-entity-picker-presentation.lib'
import { LOCATION_CONNECTION_KIND_CHANGE_LABEL } from '../../lib/location-connection-drawer-intent'
import {
  buildOrganizationFields,
  buildOrganizationFormValueSyncs,
  organizationCreateDefaultValues,
  organizationFormSchema,
} from '../../lib/forms/organization-form-projection'
import { BUILDING_ORGANIZATION_NO_INTENT_KIND_REASON } from '../lib/building-organization-create-drafts'
import { canConfirmBuildingOrganizationRelationship } from '../lib/building-organizations-create-tab-controller.lib'
import {
  BUILDING_ORGANIZATIONS_ADD_RELATIONSHIP_LABEL,
  BUILDING_ORGANIZATIONS_CHOOSE_EXISTING_LABEL,
  BUILDING_ORGANIZATIONS_CREATE_NEW_LABEL,
  BUILDING_ORGANIZATIONS_INTENT_PROMPT,
  BUILDING_ORGANIZATIONS_LOAD_ERROR_TITLE,
  BUILDING_ORGANIZATIONS_LOADING_LABEL,
  BUILDING_ORGANIZATIONS_ORGANIZATION_CHANGE_LABEL,
  BUILDING_ORGANIZATIONS_ORGANIZATION_EYEBROW,
  BUILDING_ORGANIZATIONS_RELATIONSHIP_EYEBROW,
  BUILDING_ORGANIZATIONS_SEARCH_PLACEHOLDER,
  BUILDING_ORGANIZATIONS_SELECT_LABEL,
  BUILDING_ORGANIZATIONS_UPDATE_RELATIONSHIP_LABEL,
  resolveBuildingOrganizationTargetDomainLabel,
  resolveBuildingOrganizationTargetName,
} from '../lib/building-organizations-create-tab.lib'
import type { UseBuildingOrganizationsCreateTabResult } from '../hooks/use-building-organizations-create-tab.client'
import type { BuildingOrganizationRelationshipDraft } from '../lib/building-organization-create-drafts'
import {
  buildingOrganizationsComposerClasses,
  buildingOrganizationsConfirmActionsClasses,
  buildingOrganizationsDiscoveryControlsClasses,
  buildingOrganizationsDiscoveryCreateActionClasses,
  buildingOrganizationsDiscoveryClasses,
  buildingOrganizationsDiscoveryListClasses,
} from './building-organizations-create-tab.variants'

function BuildingOrganizationConfirmButton({
  confirmLabel,
  disabled,
  onConfirm,
  submit = false,
}: {
  confirmLabel: string
  disabled: boolean
  onConfirm?: () => void
  submit?: boolean
}) {
  return (
    <div className={buildingOrganizationsConfirmActionsClasses}>
      <Button
        type={submit ? 'submit' : 'button'}
        variant="outline"
        size="sm"
        density="compact"
        disabled={disabled}
        onClick={onConfirm}
      >
        {confirmLabel}
      </Button>
    </div>
  )
}

function BuildingOrganizationDiscoveryRow({
  organization,
  kind,
  kindOptionsFor,
  selectExistingOrganization,
  resolveBuildingOrganizationSelectState,
}: Pick<
  UseBuildingOrganizationsCreateTabResult,
  'kindOptionsFor' | 'selectExistingOrganization' | 'resolveBuildingOrganizationSelectState'
> & {
  organization: UseBuildingOrganizationsCreateTabResult['visibleOrganizations'][number]
  kind: OrganizationLocationConnectionKind | null
}) {
  const options = kindOptionsFor({ kind: 'existing', organizationId: organization.id })
  const selectState = resolveBuildingOrganizationSelectState({ kind, options })
  const entity = buildOrganizationPickerEntitySummary(organization, {
    ...(selectState.selectDisabledReason ? { description: undefined } : {}),
  })
  const entityWithStatus = selectState.selectDisabledReason
    ? { ...entity, status: [{ kind: 'text' as const, label: selectState.selectDisabledReason }] }
    : entity

  return (
    <ContentEntityCard
      entity={entityWithStatus}
      density="compact"
      trailing={{
        kind: 'action',
        content: (
          <Button
            type="button"
            variant="outline"
            size="sm"
            density="compact"
            disabled={selectState.selectDisabled}
            onClick={() => selectExistingOrganization(organization.id)}
          >
            {BUILDING_ORGANIZATIONS_SELECT_LABEL}
          </Button>
        ),
      }}
    />
  )
}

export function BuildingOrganizationDiscovery({
  controller,
}: {
  controller: UseBuildingOrganizationsCreateTabResult
}) {
  const {
    kind,
    searchQuery,
    setSearchQuery,
    isPending,
    isError,
    visibleOrganizations,
    kindOptionsFor,
    selectExistingOrganization,
    enterNewOrganizationBranch,
    resolveBuildingOrganizationSelectState,
  } = controller

  return (
    <div className={buildingOrganizationsDiscoveryClasses}>
      <div className={buildingOrganizationsDiscoveryControlsClasses}>
        <SearchBar
          id="building-organization-search"
          placeholder={BUILDING_ORGANIZATIONS_SEARCH_PLACEHOLDER}
          ariaLabel={BUILDING_ORGANIZATIONS_SEARCH_PLACEHOLDER}
          value={searchQuery}
          onValueChange={setSearchQuery}
        />
        <div className={buildingOrganizationsDiscoveryCreateActionClasses}>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            density="compact"
            onClick={enterNewOrganizationBranch}
          >
            {BUILDING_ORGANIZATIONS_CREATE_NEW_LABEL}
          </Button>
        </div>
      </div>
      <div className={buildingOrganizationsDiscoveryListClasses}>
        {isError ? (
          <Alert variant="destructive" title={BUILDING_ORGANIZATIONS_LOAD_ERROR_TITLE} />
        ) : null}
        {isPending ? <Text variant="muted">{BUILDING_ORGANIZATIONS_LOADING_LABEL}</Text> : null}
        {!isPending && visibleOrganizations.length === 0 ? (
          <Text variant="muted">No Organizations match this search.</Text>
        ) : null}
        {visibleOrganizations.map((organization) => (
          <BuildingOrganizationDiscoveryRow
            key={organization.id}
            organization={organization}
            kind={kind}
            kindOptionsFor={kindOptionsFor}
            selectExistingOrganization={selectExistingOrganization}
            resolveBuildingOrganizationSelectState={resolveBuildingOrganizationSelectState}
          />
        ))}
      </div>
    </div>
  )
}

export function BuildingOrganizationNewBranch({
  controller,
  confirmLabel,
}: {
  controller: UseBuildingOrganizationsCreateTabResult
  confirmLabel: string
}) {
  const {
    context,
    returnToDiscovery,
    commitNew,
    newOrganizationDraftId,
    kind,
    validationAttempted,
  } = controller

  return (
    <>
      <div>
        <Button type="button" variant="ghost" onClick={returnToDiscovery}>
          {BUILDING_ORGANIZATIONS_CHOOSE_EXISTING_LABEL}
        </Button>
      </div>
      <Form
        key={newOrganizationDraftId ?? 'new-organization'}
        id="building-new-organization-draft"
        schema={organizationFormSchema}
        fields={buildOrganizationFields(context, { includeName: true })}
        defaultValues={organizationCreateDefaultValues}
        valueSyncs={buildOrganizationFormValueSyncs()}
        onSubmit={commitNew}
        footer={
          <BuildingOrganizationConfirmButton
            confirmLabel={confirmLabel}
            disabled={validationAttempted && !kind}
            submit
          />
        }
      />
    </>
  )
}

function BuildingOrganizationReviewStage({
  controller,
  confirmLabel,
  onConfirm,
  canConfirm,
}: {
  controller: UseBuildingOrganizationsCreateTabResult
  confirmLabel: string
  onConfirm: () => void
  canConfirm: boolean
}) {
  const {
    kind,
    selectedOrganization,
    returnToDiscovery,
    plan,
    organizations,
    validationAttempted,
  } = controller
  if (!kind || !selectedOrganization) return null

  return (
    <>
      <ChooserSummaryCard
        density="compact"
        eyebrow={BUILDING_ORGANIZATIONS_ORGANIZATION_EYEBROW}
        changeLabel={BUILDING_ORGANIZATIONS_ORGANIZATION_CHANGE_LABEL}
        title={resolveBuildingOrganizationTargetName({
          organization: selectedOrganization,
          plan,
          existingOrganizations: organizations,
        })}
        description={
          resolveBuildingOrganizationTargetDomainLabel({
            organization: selectedOrganization,
            plan,
            existingOrganizations: organizations,
          }) || undefined
        }
        onChange={returnToDiscovery}
      />
      <BuildingOrganizationConfirmButton
        confirmLabel={confirmLabel}
        disabled={!canConfirm || (validationAttempted && !kind)}
        onConfirm={onConfirm}
      />
    </>
  )
}

function BuildingOrganizationRelationshipKindStep({
  controller,
  relationship,
}: {
  controller: UseBuildingOrganizationsCreateTabResult
  relationship?: BuildingOrganizationRelationshipDraft
}) {
  const { kind, handleKindChange, intentKindOptions, kindOptionsFor } = controller
  const relationshipKindOptions = relationship
    ? kindOptionsFor(relationship.organization, relationship.draftId)
    : intentKindOptions

  return (
    <LocationConnectionKindStep
      id={
        relationship
          ? `building-organization-pending-kind-${relationship.draftId}`
          : 'building-organization-relationship-kind'
      }
      label={BUILDING_ORGANIZATIONS_INTENT_PROMPT}
      summaryEyebrow={BUILDING_ORGANIZATIONS_RELATIONSHIP_EYEBROW}
      options={relationshipKindOptions}
      value={kind}
      onValueChange={(value) => handleKindChange(value as OrganizationLocationConnectionKind)}
      changeLabel={LOCATION_CONNECTION_KIND_CHANGE_LABEL}
      defaultExpanded={!kind}
    />
  )
}

function BuildingOrganizationRelationshipStage({
  controller,
  relationship,
  confirmLabel,
  onConfirm,
}: {
  controller: UseBuildingOrganizationsCreateTabResult
  relationship?: BuildingOrganizationRelationshipDraft
  confirmLabel: string
  onConfirm: () => void
}) {
  const { kind, composerStage, selectedOrganization, kindOptionsFor, editingDraftId } = controller
  const organizationOptions = selectedOrganization
    ? kindOptionsFor(selectedOrganization, editingDraftId ?? relationship?.draftId)
    : []
  const canConfirm = canConfirmBuildingOrganizationRelationship({
    kind,
    selectedOrganization,
    composerStage,
    organizationOptions,
  })

  if (composerStage === 'discovery' && kind) {
    return <BuildingOrganizationDiscovery controller={controller} />
  }
  if (composerStage === 'review') {
    return (
      <BuildingOrganizationReviewStage
        controller={controller}
        confirmLabel={confirmLabel}
        onConfirm={onConfirm}
        canConfirm={canConfirm}
      />
    )
  }
  if (composerStage === 'branch' && kind && selectedOrganization) {
    return <BuildingOrganizationNewBranch controller={controller} confirmLabel={confirmLabel} />
  }
  return null
}

export function BuildingOrganizationRelationshipReview({
  controller,
  relationship,
  confirmLabel,
  onConfirm,
}: {
  controller: UseBuildingOrganizationsCreateTabResult
  relationship?: BuildingOrganizationRelationshipDraft
  confirmLabel: string
  onConfirm: () => void
}) {
  return (
    <div className={buildingOrganizationsComposerClasses}>
      <BuildingOrganizationRelationshipKindStep
        controller={controller}
        relationship={relationship}
      />
      <BuildingOrganizationRelationshipStage
        controller={controller}
        relationship={relationship}
        confirmLabel={confirmLabel}
        onConfirm={onConfirm}
      />
    </div>
  )
}

export function BuildingOrganizationComposer({
  controller,
}: {
  controller: UseBuildingOrganizationsCreateTabResult
}) {
  const { kind, intentState, commitExisting } = controller

  if (intentState.eligibleCount === 0 && !kind) {
    return (
      <Text variant="muted" role="status">
        {intentState.addDisabledReason ?? BUILDING_ORGANIZATION_NO_INTENT_KIND_REASON}
      </Text>
    )
  }

  return (
    <BuildingOrganizationRelationshipReview
      controller={controller}
      confirmLabel={BUILDING_ORGANIZATIONS_ADD_RELATIONSHIP_LABEL}
      onConfirm={commitExisting}
    />
  )
}

export function BuildingOrganizationPendingEdit({
  controller,
  relationship,
}: {
  controller: UseBuildingOrganizationsCreateTabResult
  relationship: BuildingOrganizationRelationshipDraft
}) {
  const { commitPendingEdit, cancelPendingEdit, composerStage } = controller

  return (
    <div className={buildingOrganizationsComposerClasses}>
      <BuildingOrganizationRelationshipReview
        controller={controller}
        relationship={relationship}
        confirmLabel={BUILDING_ORGANIZATIONS_UPDATE_RELATIONSHIP_LABEL}
        onConfirm={() => commitPendingEdit(relationship)}
      />
      {composerStage === 'discovery' ? (
        <div className={buildingOrganizationsConfirmActionsClasses}>
          <Button type="button" variant="ghost" size="sm" onClick={cancelPendingEdit}>
            Cancel edit
          </Button>
        </div>
      ) : null}
    </div>
  )
}
