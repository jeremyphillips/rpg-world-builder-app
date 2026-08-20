'use client'

import { type OrganizationLocationConnectionKind } from '@rpg/contracts'
import {
  Alert,
  Button,
  Heading,
  RadioCardField,
  SearchBar,
  SelectionSummaryChangeAction,
  SelectionSummaryRow,
  Text,
  type RadioCardOption,
} from '@rpg/ui'
import { Form } from '@rpg/ui/form'

import {
  BUILDING_ORGANIZATION_COMPOSER_CHANGE_LABEL,
  type BuildingOrganizationComposerSummaryRow,
} from '../lib/building-organizations-create-tab-controller.lib'
import { ContentEntityCard } from '../../lib/content-entity-card.client'
import { buildOrganizationPickerEntitySummary } from '../../lib/content-entity-picker-presentation.lib'
import {
  buildOrganizationFields,
  buildOrganizationFormValueSyncs,
  organizationCreateDefaultValues,
  organizationFormSchema,
} from '../../lib/forms/organization-form-projection'
import { resolveDiscoverableOrganizationMemberClasses } from '../../organizations/lib/organization-member-class-discoverable.lib'
import { BUILDING_ORGANIZATION_NO_INTENT_KIND_REASON } from '../lib/building-organization-create-drafts'
import {
  BUILDING_NEW_ORGANIZATION_FORM_ID,
  BUILDING_ORGANIZATIONS_BRANCH_HEADING,
  BUILDING_ORGANIZATIONS_BRANCH_HELPER,
  BUILDING_ORGANIZATIONS_CHOOSE_EXISTING_LABEL,
  BUILDING_ORGANIZATIONS_COMPOSER_HEADING,
  BUILDING_ORGANIZATIONS_CREATE_NEW_LABEL,
  BUILDING_ORGANIZATIONS_DISCOVERY_HEADING,
  BUILDING_ORGANIZATIONS_DISCOVERY_HELPER,
  BUILDING_ORGANIZATIONS_EMPTY_SEARCH_LABEL,
  BUILDING_ORGANIZATIONS_INTENT_PROMPT,
  BUILDING_ORGANIZATIONS_LOAD_ERROR_TITLE,
  BUILDING_ORGANIZATIONS_LOADING_LABEL,
  BUILDING_ORGANIZATIONS_SEARCH_LABEL,
  BUILDING_ORGANIZATIONS_SEARCH_PLACEHOLDER,
  BUILDING_ORGANIZATIONS_SELECT_LABEL,
} from '../lib/building-organizations-create-tab.lib'
import type { UseBuildingOrganizationsCreateTabResult } from '../hooks/use-building-organizations-create-tab.client'
import type {
  BuildingOrganizationRelationshipDraft,
  BuildingOrganizationRelationshipKindOption,
} from '../lib/building-organization-create-drafts'
import {
  buildingOrganizationsChooseExistingClasses,
  buildingOrganizationsComposerClasses,
  buildingOrganizationsComposerHeadingClasses,
  buildingOrganizationsComposerStageOffsetClasses,
  buildingOrganizationsComposerSummaryRowsClasses,
  buildingOrganizationsDiscoveryControlsClasses,
  buildingOrganizationsDiscoveryCreateActionClasses,
  buildingOrganizationsDiscoveryClasses,
  buildingOrganizationsDiscoveryListClasses,
  buildingOrganizationsStageSubheadingClasses,
} from './building-organizations-create-tab.variants'
import {
  OrganizationAuthoringFormShell,
  OrganizationAuthoringPresetBridge,
} from '../../organizations/components/organization-authoring-form-shell.client'
import { useOrganizationAuthoringContext } from '../../organizations/lib/organization-authoring-context.client'

function toRelationshipRadioOptions(
  options: readonly BuildingOrganizationRelationshipKindOption[],
): RadioCardOption[] {
  return options.map((option) => ({
    value: option.value,
    label: option.label,
    description: option.disabled ? option.disabledReason : option.description,
    disabled: option.disabled,
  }))
}

function mapSummaryRow(
  row: BuildingOrganizationComposerSummaryRow,
  view: UseBuildingOrganizationsCreateTabResult['composerView'],
  startEditingRelationship: UseBuildingOrganizationsCreateTabResult['startEditingRelationship'],
  startEditingOrganization: UseBuildingOrganizationsCreateTabResult['startEditingOrganization'],
) {
  const showChange =
    row.decision === 'relationship' ? view.showRelationshipChange : view.showOrganizationChange
  const onChange =
    row.decision === 'relationship' ? startEditingRelationship : startEditingOrganization
  const valueActionAriaLabel = `Change ${row.label.toLowerCase()}`

  return {
    label: row.label,
    value: row.value,
    onValueClick: showChange ? onChange : undefined,
    valueActionAriaLabel: showChange ? valueActionAriaLabel : undefined,
    action: showChange ? (
      <SelectionSummaryChangeAction
        changeLabel={BUILDING_ORGANIZATION_COMPOSER_CHANGE_LABEL}
        ariaLabel={valueActionAriaLabel}
        onChange={onChange}
      />
    ) : undefined,
  }
}

function BuildingOrganizationComposerSummaryRows({
  controller,
}: {
  controller: UseBuildingOrganizationsCreateTabResult
}) {
  const { composerView, startEditingOrganization, startEditingRelationship } = controller
  const { summaryRows } = composerView

  if (summaryRows.length === 0) return null

  return (
    <dl className={buildingOrganizationsComposerSummaryRowsClasses}>
      {summaryRows.map((row, index) => (
        <SelectionSummaryRow
          key={row.id}
          {...mapSummaryRow(row, composerView, startEditingRelationship, startEditingOrganization)}
          showDivider={index > 0}
        />
      ))}
    </dl>
  )
}

function BuildingOrganizationRelationshipKindField({
  controller,
  relationship,
}: {
  controller: UseBuildingOrganizationsCreateTabResult
  relationship?: BuildingOrganizationRelationshipDraft
}) {
  const { rawKind, handleKindChange, intentKindOptions, kindOptionsFor } = controller
  const relationshipKindOptions = relationship
    ? kindOptionsFor(relationship.organization, relationship.draftId)
    : intentKindOptions

  if (relationshipKindOptions.length === 1) {
    const resolved = relationshipKindOptions[0]
    if (!resolved) return null

    return (
      <div className="space-y-1">
        <Heading variant="label" as="p">
          {BUILDING_ORGANIZATIONS_INTENT_PROMPT}
        </Heading>
        <Text>{resolved.label}</Text>
      </div>
    )
  }

  if (relationshipKindOptions.length === 0) return null

  return (
    <RadioCardField
      id={
        relationship
          ? `building-organization-pending-kind-${relationship.draftId}`
          : 'building-organization-relationship-kind'
      }
      label={BUILDING_ORGANIZATIONS_INTENT_PROMPT}
      density="compact"
      value={rawKind ?? ''}
      options={toRelationshipRadioOptions(relationshipKindOptions)}
      onValueChange={(value) => handleKindChange(value as OrganizationLocationConnectionKind)}
    />
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

function BuildingOrganizationDiscovery({
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
      <div className={buildingOrganizationsStageSubheadingClasses}>
        <Heading as="h4" variant="subsection">
          {BUILDING_ORGANIZATIONS_DISCOVERY_HEADING}
        </Heading>
        <Text variant="muted">{BUILDING_ORGANIZATIONS_DISCOVERY_HELPER}</Text>
      </div>
      <div className={buildingOrganizationsDiscoveryControlsClasses}>
        <SearchBar
          id="building-organization-search"
          placeholder={BUILDING_ORGANIZATIONS_SEARCH_PLACEHOLDER}
          ariaLabel={BUILDING_ORGANIZATIONS_SEARCH_LABEL}
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
        {!isPending && !isError && visibleOrganizations.length === 0 ? (
          <Text variant="muted">{BUILDING_ORGANIZATIONS_EMPTY_SEARCH_LABEL}</Text>
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

function BuildingOrganizationNewOrganizationForm({
  context,
  newOrganizationDraftId,
  commitNew,
}: {
  context: UseBuildingOrganizationsCreateTabResult['context']
  newOrganizationDraftId: string | null
  commitNew: UseBuildingOrganizationsCreateTabResult['commitNew']
}) {
  const { practiceRecommendations } = useOrganizationAuthoringContext()

  return (
    <Form
      key={newOrganizationDraftId ?? 'new-organization'}
      id={BUILDING_NEW_ORGANIZATION_FORM_ID}
      schema={organizationFormSchema}
      fields={buildOrganizationFields(context, {
        includeName: true,
        recommendedPracticeIds: practiceRecommendations,
      })}
      defaultValues={organizationCreateDefaultValues}
      valueSyncs={buildOrganizationFormValueSyncs(
        undefined,
        resolveDiscoverableOrganizationMemberClasses(context),
      )}
      onSubmit={commitNew}
      header={() => <OrganizationAuthoringPresetBridge />}
    />
  )
}

function BuildingOrganizationNewBranch({
  controller,
}: {
  controller: UseBuildingOrganizationsCreateTabResult
}) {
  const { context, returnToDiscovery, commitNew, newOrganizationDraftId } = controller

  return (
    <>
      <div className={buildingOrganizationsChooseExistingClasses}>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          density="compact"
          onClick={returnToDiscovery}
        >
          {BUILDING_ORGANIZATIONS_CHOOSE_EXISTING_LABEL}
        </Button>
      </div>
      <div className={buildingOrganizationsStageSubheadingClasses}>
        <Heading as="h4" variant="subsection">
          {BUILDING_ORGANIZATIONS_BRANCH_HEADING}
        </Heading>
        <Text variant="muted">{BUILDING_ORGANIZATIONS_BRANCH_HELPER}</Text>
      </div>
      <OrganizationAuthoringFormShell>
        <BuildingOrganizationNewOrganizationForm
          context={context}
          newOrganizationDraftId={newOrganizationDraftId}
          commitNew={commitNew}
        />
      </OrganizationAuthoringFormShell>
    </>
  )
}

export function BuildingOrganizationRelationshipReview({
  controller,
  relationship,
}: {
  controller: UseBuildingOrganizationsCreateTabResult
  relationship?: BuildingOrganizationRelationshipDraft
}) {
  const { composerView } = controller

  return (
    <div className={buildingOrganizationsComposerClasses} data-building-organization-composer>
      {composerView.activeDecision === 'relationship' ? (
        <BuildingOrganizationRelationshipKindField
          controller={controller}
          relationship={relationship}
        />
      ) : null}
      {composerView.summaryRows.length > 0 ? (
        <BuildingOrganizationComposerSummaryRows controller={controller} />
      ) : null}
      {composerView.showDiscovery ? (
        <div className={buildingOrganizationsComposerStageOffsetClasses}>
          <BuildingOrganizationDiscovery controller={controller} />
        </div>
      ) : null}
      {composerView.showBranch ? (
        <div className={buildingOrganizationsComposerStageOffsetClasses}>
          <BuildingOrganizationNewBranch controller={controller} />
        </div>
      ) : null}
    </div>
  )
}

export function BuildingOrganizationComposer({
  controller,
}: {
  controller: UseBuildingOrganizationsCreateTabResult
}) {
  const { kind, intentState } = controller

  if (intentState.eligibleCount === 0 && !kind) {
    return (
      <Text variant="muted" role="status">
        {intentState.addDisabledReason ?? BUILDING_ORGANIZATION_NO_INTENT_KIND_REASON}
      </Text>
    )
  }

  return (
    <div className={buildingOrganizationsComposerHeadingClasses}>
      <Heading as="h3" variant="subsection">
        {BUILDING_ORGANIZATIONS_COMPOSER_HEADING}
      </Heading>
      <BuildingOrganizationRelationshipReview controller={controller} />
    </div>
  )
}
