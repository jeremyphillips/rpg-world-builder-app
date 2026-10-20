import { type OrganizationLocationConnectionKind } from '@rpg/contracts'
import {
  Alert,
  Button,
  Heading,
  RadioCardField,
  RadioGroup,
  SearchBar,
  Text,
  type RadioCardOption,
} from '@rpg/ui'
import { Form } from '@rpg/ui/form'

import {
  CreateCompositionComposer,
  CreateCompositionStage,
  CreateCompositionSummary,
  createCompositionStageSubheadingClasses,
  useCreateFlowFormDensity,
  CREATE_FLOW_FORM_DENSITY,
} from '@/lib/create-flow'

import { CatalogCard } from '@/features/content'
import {
  buildOrganizationEntityCardModel,
  buildOrganizationEntitySummaryVm,
} from '../../../organizations/lib/organization-display'
import {
  buildOrganizationFields,
  buildOrganizationFormValueSyncs,
  organizationCreateDefaultValues,
  organizationFormSchema,
} from '../../../lib/forms/organization-form-projection'
import { resolveDiscoverableOrganizationMemberClasses } from '../../../organizations/lib/members/organization-member-class-discoverable.lib'
import { BUILDING_ORGANIZATION_NO_INTENT_KIND_REASON } from '../../lib/building-organizations/building-organization-create-drafts'
import { mapBuildingOrganizationCompositionSummaryRows } from '../../lib/building-organizations/building-organization-composition-presentation.lib'
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
} from '../../lib/building-organizations/building-organizations-create-tab.lib'
import type { UseBuildingOrganizationsCreateTabResult } from '../../hooks/use-building-organizations-create-tab'
import type {
  BuildingOrganizationRelationshipDraft,
  BuildingOrganizationRelationshipKindOption,
} from '../../lib/building-organizations/building-organization-create-drafts'
import {
  buildingOrganizationsDiscoveryBodyClasses,
  buildingOrganizationsDiscoveryControlsClasses,
  buildingOrganizationsDiscoveryCreateActionClasses,
  buildingOrganizationsDiscoveryListClasses,
} from './building-organizations-create-tab.variants'
import { OrganizationAuthoringFormShell } from '../../../organizations/components/create/organization-authoring-form-shell'
import { OrganizationAuthoringPresetBridge } from '../../../organizations/components/create/organization-authoring-preset-bridge'
import { useOrganizationAuthoringContext } from '../../../organizations/components/authoring/use-organization-authoring-context'

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
      <div className={createCompositionStageSubheadingClasses}>
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
      tone="quiet"
      value={rawKind ?? ''}
      options={toRelationshipRadioOptions(relationshipKindOptions)}
      onValueChange={(value) => handleKindChange(value as OrganizationLocationConnectionKind)}
    />
  )
}

function resolveBuildingOrganizationDiscoveryDomIds(organizationId: string) {
  const itemId = `building-organization-discovery-${organizationId}`
  return {
    itemId,
    titleId: `${itemId}-title`,
    bodyId: `${itemId}-body`,
  }
}

function BuildingOrganizationDiscoveryRow({
  organization,
  kind,
  kindOptionsFor,
  resolveBuildingOrganizationSelectState,
}: Pick<
  UseBuildingOrganizationsCreateTabResult,
  'kindOptionsFor' | 'resolveBuildingOrganizationSelectState'
> & {
  organization: UseBuildingOrganizationsCreateTabResult['visibleOrganizations'][number]
  kind: OrganizationLocationConnectionKind | null
}) {
  const options = kindOptionsFor({ kind: 'existing', organizationId: organization.id })
  const selectState = resolveBuildingOrganizationSelectState({ kind, options })
  return (
    <CatalogCard
      toolbarLabel={organization.name}
      domIds={resolveBuildingOrganizationDiscoveryDomIds(organization.id)}
      entity={buildOrganizationEntityCardModel(buildOrganizationEntitySummaryVm(organization), {
        status: selectState.selectDisabledReason
          ? [{ kind: 'text', label: selectState.selectDisabledReason }]
          : undefined,
      })}
      selection={{
        value: organization.id,
        disabled: selectState.selectDisabled,
      }}
    />
  )
}

function BuildingOrganizationDiscoveryBody({
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
    enterNewOrganizationBranch,
    resolveBuildingOrganizationSelectState,
    selectedOrganization,
    selectExistingOrganization,
  } = controller

  return (
    <div className={buildingOrganizationsDiscoveryBodyClasses}>
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
            variant="text"
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
        <RadioGroup
          aria-label={BUILDING_ORGANIZATIONS_DISCOVERY_HEADING}
          value={
            selectedOrganization?.kind === 'existing' ? selectedOrganization.organizationId : ''
          }
          onValueChange={selectExistingOrganization}
        >
          {visibleOrganizations.map((organization) => (
            <BuildingOrganizationDiscoveryRow
              key={organization.id}
              organization={organization}
              kind={kind}
              kindOptionsFor={kindOptionsFor}
              resolveBuildingOrganizationSelectState={resolveBuildingOrganizationSelectState}
            />
          ))}
        </RadioGroup>
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
  const createFlowDensity = useCreateFlowFormDensity()

  return (
    <Form
      key={newOrganizationDraftId ?? 'new-organization'}
      id={BUILDING_NEW_ORGANIZATION_FORM_ID}
      density={createFlowDensity ?? CREATE_FLOW_FORM_DENSITY}
      schema={organizationFormSchema}
      fields={buildOrganizationFields(context, {
        includeName: true,
        presentation: 'quick',
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

export function BuildingOrganizationRelationshipReview({
  controller,
  relationship,
}: {
  controller: UseBuildingOrganizationsCreateTabResult
  relationship?: BuildingOrganizationRelationshipDraft
}) {
  const { composerView, startEditingOrganization, startEditingRelationship, returnToDiscovery } =
    controller
  const summaryRows = mapBuildingOrganizationCompositionSummaryRows({
    composerView,
    startEditingRelationship,
    startEditingOrganization,
  })

  return (
    <div data-building-organization-composer>
      {composerView.activeDecision === 'relationship' ? (
        <BuildingOrganizationRelationshipKindField
          controller={controller}
          relationship={relationship}
        />
      ) : null}

      <CreateCompositionSummary rows={summaryRows} />

      {composerView.showDiscovery ? (
        <CreateCompositionStage
          heading={BUILDING_ORGANIZATIONS_DISCOVERY_HEADING}
          helper={BUILDING_ORGANIZATIONS_DISCOVERY_HELPER}
        >
          <BuildingOrganizationDiscoveryBody controller={controller} />
        </CreateCompositionStage>
      ) : null}

      {composerView.showBranch ? (
        <CreateCompositionStage
          heading={BUILDING_ORGANIZATIONS_BRANCH_HEADING}
          helper={BUILDING_ORGANIZATIONS_BRANCH_HELPER}
          action={
            <Button
              type="button"
              variant="text"
              size="sm"
              density="compact"
              onClick={returnToDiscovery}
            >
              {BUILDING_ORGANIZATIONS_CHOOSE_EXISTING_LABEL}
            </Button>
          }
        >
          <OrganizationAuthoringFormShell presentation="quick">
            <BuildingOrganizationNewOrganizationForm
              context={controller.context}
              newOrganizationDraftId={controller.newOrganizationDraftId}
              commitNew={controller.commitNew}
            />
          </OrganizationAuthoringFormShell>
        </CreateCompositionStage>
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
    <div className="ui-card-tone-host--inherit">
      <CreateCompositionComposer heading={BUILDING_ORGANIZATIONS_COMPOSER_HEADING}>
        <BuildingOrganizationRelationshipReview controller={controller} />
      </CreateCompositionComposer>
    </div>
  )
}
