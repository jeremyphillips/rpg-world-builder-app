'use client'

import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { buttonVariants, Heading, Text } from '@rpg/ui'
import { Form, FormSaveFooter } from '@rpg/ui/form'

import { PageHeader } from '@/components/layout/page-header'
import { PageLoadState } from '@/components/layout/page-load-state'
import { WidePage } from '@/components/layout/wide-page'
import { useSetBreadcrumbLabel } from '@/components/layout/use-breadcrumb-label'
import { ROUTES } from '@/app/routes'
import { FormUnsavedChangesGuard } from '@/lib/form-unsaved-changes-guard'
import { useSubmitHandler } from '@/lib/use-submit-handler'
import {
  buildCharacterCreationPatchInput,
  buildMechanicsConfigFields,
  buildMechanicsPatchInput,
  buildRulesConfigFields,
  CHARACTER_CONFIGURATION_SECTIONS,
  mapRulesetPatchToMechanicsValues,
  mapRulesetPatchToRulesValues,
  MECHANICS_CONFIGURATION_SECTIONS,
  mechanicsValuesSchema,
  resolveRulesSchema,
  type MechanicsValues,
  type RulesValues,
  useCanManageCampaign,
} from '@/features/campaign'

import { RulesConfigFieldNav } from '../components/rules-config-field-nav.client'
import { buildEditionPresetFieldOptions } from '../lib/vocabulary/sets/edition-presets'
import { buildAttackResolutionModeFieldOptions } from '../lib/vocabulary/sets/attack-resolution-modes'
import { buildActiveCreatureTypeFieldOptions } from '../lib/vocabulary/sets/creature-types'
import { disableFormItems } from '@/lib/disable-form-items'
import { findRulesConfigEntry, type RulesConfigId } from '../lib/hub/rules-config-registry'
import { useAttackResolutionModeVocabulary } from '../hooks/use-attack-resolution-mode-vocabulary'
import { useCreatureTypeVocabulary } from '../hooks/use-creature-type-vocabulary'
import { useEditionPresetVocabulary } from '../hooks/use-edition-preset-vocabulary'
import { usePatchCharacterCreationMutation } from '../hooks/use-patch-character-creation-mutation'
import { usePatchMechanicsMutation } from '../hooks/use-patch-mechanics-mutation'
import { useRulesetPatch } from '../hooks/use-ruleset-patch'

const UNKNOWN_RULES_CONFIG_MESSAGE = 'This rules configuration page is not available.'

const RULES_CONFIG_NAV: Record<
  RulesConfigId,
  {
    sections: typeof CHARACTER_CONFIGURATION_SECTIONS | typeof MECHANICS_CONFIGURATION_SECTIONS
    navLabel: string
    mobileSelectLabel: string
  }
> = {
  'character-configuration': {
    sections: CHARACTER_CONFIGURATION_SECTIONS,
    navLabel: 'Character configuration sections',
    mobileSelectLabel: 'Character configuration section',
  },
  mechanics: {
    sections: MECHANICS_CONFIGURATION_SECTIONS,
    navLabel: 'Mechanics configuration sections',
    mobileSelectLabel: 'Mechanics configuration section',
  },
}

export type RulesConfigDetailContentProps = {
  campaignId: string
  configId: string
}

function CharacterConfigurationForm({ campaignId }: { campaignId: string }) {
  const canManage = useCanManageCampaign(campaignId)
  const { data: patch, isPending, isError } = useRulesetPatch(campaignId)
  const {
    vocabulary,
    isPending: isVocabularyPending,
    isError: isVocabularyError,
  } = useCreatureTypeVocabulary(campaignId)
  const {
    mutateAsync,
    isPending: isSaving,
    isSuccess,
  } = usePatchCharacterCreationMutation(campaignId)

  const schema = useMemo(() => resolveRulesSchema(vocabulary?.activeIds), [vocabulary?.activeIds])

  const fields = useMemo(() => {
    const creatureTypeOptions = buildActiveCreatureTypeFieldOptions(vocabulary)
    return disableFormItems(buildRulesConfigFields(creatureTypeOptions), !canManage)
  }, [canManage, vocabulary])

  const defaultValues = useMemo(
    () => (patch ? mapRulesetPatchToRulesValues(patch.characterCreation) : undefined),
    [patch],
  )

  const { onSubmit, formError } = useSubmitHandler<RulesValues>(async (values, form) => {
    await mutateAsync(buildCharacterCreationPatchInput(values))
    form.reset(values)
  }, 'Could not save character configuration.')

  return (
    <PageLoadState
      isPending={isPending || isVocabularyPending}
      isError={isError || isVocabularyError}
      defaultErrorLabel="Could not load character configuration."
    >
      {defaultValues ? (
        <>
          <PageHeader heading="Character Configuration" />
          {!canManage ? (
            <Text variant="muted">
              You can view these rules but only campaign owners can edit them.
            </Text>
          ) : null}
          <Form<RulesValues>
            key={campaignId}
            schema={schema}
            fields={fields}
            defaultValues={defaultValues}
            onSubmit={onSubmit}
            formError={formError}
            collapsibleSections={false}
            stickyFooter={canManage}
            footer={
              canManage
                ? (form) => (
                    <>
                      <FormUnsavedChangesGuard />
                      <FormSaveFooter
                        pending={isSaving || form.formState.isSubmitting}
                        isSuccess={isSuccess}
                        submitLabel="Save changes"
                        successMessage="Changes saved."
                      />
                    </>
                  )
                : undefined
            }
          />
        </>
      ) : null}
    </PageLoadState>
  )
}

function MechanicsConfigurationForm({ campaignId }: { campaignId: string }) {
  const canManage = useCanManageCampaign(campaignId)
  const { data: patch, isPending, isError } = useRulesetPatch(campaignId)
  const {
    vocabulary: editionPresetVocabulary,
    isPending: isEditionPresetPending,
    isError: isEditionPresetError,
  } = useEditionPresetVocabulary(campaignId)
  const {
    vocabulary: attackResolutionVocabulary,
    isPending: isAttackResolutionPending,
    isError: isAttackResolutionError,
  } = useAttackResolutionModeVocabulary(campaignId)
  const { mutateAsync, isPending: isSaving, isSuccess } = usePatchMechanicsMutation(campaignId)

  const fields = useMemo(() => {
    return disableFormItems(
      buildMechanicsConfigFields({
        editionPresetOptions: buildEditionPresetFieldOptions(editionPresetVocabulary),
        attackResolutionModeOptions: buildAttackResolutionModeFieldOptions(
          attackResolutionVocabulary,
        ),
      }),
      !canManage,
    )
  }, [attackResolutionVocabulary, canManage, editionPresetVocabulary])

  const defaultValues = useMemo(
    () => (patch ? mapRulesetPatchToMechanicsValues(patch.mechanics) : undefined),
    [patch],
  )

  const { onSubmit, formError } = useSubmitHandler<MechanicsValues>(async (values, form) => {
    await mutateAsync(buildMechanicsPatchInput(values))
    form.reset(values)
  }, 'Could not save mechanics configuration.')

  return (
    <PageLoadState
      isPending={isPending || isEditionPresetPending || isAttackResolutionPending}
      isError={isError || isEditionPresetError || isAttackResolutionError}
      defaultErrorLabel="Could not load mechanics configuration."
    >
      {defaultValues ? (
        <>
          <PageHeader heading="Mechanics" />
          {!canManage ? (
            <Text variant="muted">
              You can view these rules but only campaign owners can edit them.
            </Text>
          ) : null}
          <Form<MechanicsValues>
            key={campaignId}
            schema={mechanicsValuesSchema}
            fields={fields}
            defaultValues={defaultValues}
            onSubmit={onSubmit}
            formError={formError}
            collapsibleSections={false}
            stickyFooter={canManage}
            footer={
              canManage
                ? (form) => (
                    <>
                      <FormUnsavedChangesGuard />
                      <FormSaveFooter
                        pending={isSaving || form.formState.isSubmitting}
                        isSuccess={isSuccess}
                        submitLabel="Save changes"
                        successMessage="Changes saved."
                      />
                    </>
                  )
                : undefined
            }
          />
        </>
      ) : null}
    </PageLoadState>
  )
}

/** Shared rules configuration detail — anchor nav and config-specific form. */
export function RulesConfigDetailContent({ campaignId, configId }: RulesConfigDetailContentProps) {
  const registryEntry = findRulesConfigEntry(configId)
  useSetBreadcrumbLabel(registryEntry?.label)

  if (!registryEntry) {
    return (
      <WidePage spacing="relaxed">
        <PageHeader heading="Rules Configuration" />
        <Text variant="muted">{UNKNOWN_RULES_CONFIG_MESSAGE}</Text>
        <Link
          to={ROUTES.homebrew.hub(campaignId)}
          className={buttonVariants({ variant: 'outline' })}
        >
          Back to Homebrew
        </Link>
      </WidePage>
    )
  }

  if (!registryEntry.enabled) {
    return (
      <WidePage spacing="relaxed">
        <PageHeader heading={registryEntry.label} />
        <Heading variant="section" as="h2">
          Not available yet
        </Heading>
        <Text variant="muted">{UNKNOWN_RULES_CONFIG_MESSAGE}</Text>
      </WidePage>
    )
  }

  const nav = RULES_CONFIG_NAV[registryEntry.id]

  return (
    <WidePage spacing="list">
      <div className="flex flex-col gap-6 lg:flex-row">
        <RulesConfigFieldNav
          sections={nav.sections}
          navLabel={nav.navLabel}
          mobileSelectLabel={nav.mobileSelectLabel}
        />
        <div className="mx-auto min-w-0 w-full max-w-xl flex-1">
          {registryEntry.id === 'character-configuration' ? (
            <CharacterConfigurationForm campaignId={campaignId} />
          ) : (
            <MechanicsConfigurationForm campaignId={campaignId} />
          )}
        </div>
      </div>
    </WidePage>
  )
}
