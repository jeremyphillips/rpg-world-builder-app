'use client'

import { useMemo } from 'react'
import { Text } from '@rpg/ui'
import { Form } from '@rpg/ui/form'

import { PageHeader } from '@/components/layout/page-header'
import { PageLoadState } from '@/components/layout/page-load-state'
import { useSetBreadcrumbLabel } from '@/components/layout/use-breadcrumb-label'
import { useSubmitHandler } from '@/lib/use-submit-handler'
import { notifySaveSuccess } from '@/lib/notify'
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
  resolveRulesSchemaWithVocabulary,
  type MechanicsValues,
  type RulesValues,
  useCanManageCampaign,
} from '@/features/campaign'

import {
  buildActiveCreatureTypeFieldOptions,
  buildActiveLanguageFieldOptions,
  buildAttackResolutionModeFieldOptions,
  buildEditionPresetFieldOptions,
  useAttackResolutionModeVocabulary,
  useCreatureTypeVocabulary,
  useEditionPresetVocabulary,
  useLanguageVocabulary,
} from '@/features/vocabulary'

import { RulesConfigFieldNav } from '../components/rules-config-field-nav.client'
import { createRulesConfigSaveFooter } from '../components/rules-config-save-footer'
import { disableFormItems } from '@/lib/disable-form-items'
import { buildContentFormOptionSets, useEquipment } from '@/features/content'
import { HomebrewDetailFallback } from '../lib/detail/homebrew-detail-fallback'
import { HomebrewDetailMain } from '../lib/detail/homebrew-detail-main'
import { HomebrewDetailShell } from '../lib/detail/homebrew-detail-shell'
import { findRulesConfigEntry, type RulesConfigId } from '../lib/hub/rules-config-registry'
import { usePatchCharacterCreationMutation } from '../hooks/use-patch-character-creation-mutation'
import { usePatchMechanicsMutation } from '../hooks/use-patch-mechanics-mutation'
import { useRulesetPatch } from '../hooks/use-ruleset-patch'

const UNKNOWN_RULES_CONFIG_MESSAGE = 'This rules configuration page is not available.'

const RULES_CONFIG_NOT_IMPLEMENTED_MESSAGE = 'This rules configuration page is not available yet.'

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

const READ_ONLY_RULES_MESSAGE = 'You can view these rules but only campaign owners can edit them.'

function CharacterConfigurationForm({ campaignId }: { campaignId: string }) {
  const canManage = useCanManageCampaign(campaignId)
  const { data: patch, isPending, isError } = useRulesetPatch(campaignId)
  const {
    vocabulary: creatureTypeVocabulary,
    isPending: isCreatureTypeVocabularyPending,
    isError: isCreatureTypeVocabularyError,
  } = useCreatureTypeVocabulary(campaignId)
  const {
    vocabulary: languageVocabulary,
    categoryOptions,
    isPending: isLanguageVocabularyPending,
    isError: isLanguageVocabularyError,
  } = useLanguageVocabulary(campaignId)
  const {
    data: equipment,
    isPending: isEquipmentPending,
    isError: isEquipmentError,
  } = useEquipment(campaignId)
  const { mutateAsync, isPending: isSaving } = usePatchCharacterCreationMutation(campaignId)

  const schema = useMemo(
    () =>
      resolveRulesSchemaWithVocabulary({
        activeCreatureTypeIds: creatureTypeVocabulary?.activeIds,
        activeLanguageIds: languageVocabulary?.activeIds,
      }),
    [creatureTypeVocabulary?.activeIds, languageVocabulary?.activeIds],
  )

  const fields = useMemo(() => {
    const creatureTypeOptions = buildActiveCreatureTypeFieldOptions(creatureTypeVocabulary)
    const languageOptions = buildActiveLanguageFieldOptions(languageVocabulary)
    const { armor: armorOptions, weapons: weaponOptions } = buildContentFormOptionSets({
      campaignId,
      equipment,
    })
    return disableFormItems(
      buildRulesConfigFields(
        creatureTypeOptions,
        languageOptions,
        categoryOptions,
        armorOptions,
        weaponOptions,
      ),
      !canManage,
    )
  }, [
    campaignId,
    canManage,
    categoryOptions,
    creatureTypeVocabulary,
    equipment,
    languageVocabulary,
  ])

  const defaultValues = useMemo(
    () => (patch ? mapRulesetPatchToRulesValues(patch.characterCreation) : undefined),
    [patch],
  )

  const { onSubmit, formError } = useSubmitHandler<RulesValues>(async (values, form) => {
    await mutateAsync(
      buildCharacterCreationPatchInput(values, {
        includeDefaultMulticlassing: true,
        includeDefaultSubclassing: true,
        includeDefaultLanguageProficiencies: true,
        includeDefaultLevelZeroNpcs: true,
        existingLanguageChoice: patch?.characterCreation.proficiencyChoices.languages[0],
      }),
    )
    form.reset(values)
    notifySaveSuccess()
  }, 'Could not save character configuration.')

  const saveFooter = useMemo(() => createRulesConfigSaveFooter({ pending: isSaving }), [isSaving])

  return (
    <PageLoadState
      isPending={
        isPending ||
        isCreatureTypeVocabularyPending ||
        isLanguageVocabularyPending ||
        isEquipmentPending
      }
      isError={
        isError || isCreatureTypeVocabularyError || isLanguageVocabularyError || isEquipmentError
      }
      defaultErrorLabel="Could not load character configuration."
    >
      {defaultValues ? (
        <HomebrewDetailMain>
          <PageHeader heading="Character Configuration" />
          {!canManage ? <Text variant="muted">{READ_ONLY_RULES_MESSAGE}</Text> : null}
          <Form<RulesValues>
            key={campaignId}
            uiStateKey={`${campaignId}:character-configuration`}
            schema={schema}
            fields={fields}
            defaultValues={defaultValues}
            onSubmit={onSubmit}
            formError={formError}
            stickyFooter={canManage}
            footer={canManage ? saveFooter : undefined}
          />
        </HomebrewDetailMain>
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
  const { mutateAsync, isPending: isSaving } = usePatchMechanicsMutation(campaignId)

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
    notifySaveSuccess()
  }, 'Could not save mechanics configuration.')

  const saveFooter = useMemo(() => createRulesConfigSaveFooter({ pending: isSaving }), [isSaving])

  return (
    <PageLoadState
      isPending={isPending || isEditionPresetPending || isAttackResolutionPending}
      isError={isError || isEditionPresetError || isAttackResolutionError}
      defaultErrorLabel="Could not load mechanics configuration."
    >
      {defaultValues ? (
        <HomebrewDetailMain>
          <PageHeader heading="Mechanics" />
          {!canManage ? <Text variant="muted">{READ_ONLY_RULES_MESSAGE}</Text> : null}
          <Form<MechanicsValues>
            key={campaignId}
            uiStateKey={`${campaignId}:mechanics`}
            schema={mechanicsValuesSchema}
            fields={fields}
            defaultValues={defaultValues}
            onSubmit={onSubmit}
            formError={formError}
            stickyFooter={canManage}
            footer={canManage ? saveFooter : undefined}
          />
        </HomebrewDetailMain>
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
      <HomebrewDetailFallback
        status="unknown"
        heading="Rules Configuration"
        message={UNKNOWN_RULES_CONFIG_MESSAGE}
        campaignId={campaignId}
      />
    )
  }

  const nav = RULES_CONFIG_NAV[registryEntry.id]

  return (
    <HomebrewDetailShell
      nav={
        <RulesConfigFieldNav
          sections={nav.sections}
          navLabel={nav.navLabel}
          mobileSelectLabel={nav.mobileSelectLabel}
        />
      }
    >
      {registryEntry.enabled ? (
        registryEntry.id === 'character-configuration' ? (
          <CharacterConfigurationForm campaignId={campaignId} />
        ) : (
          <MechanicsConfigurationForm campaignId={campaignId} />
        )
      ) : (
        <HomebrewDetailFallback
          status="disabled"
          heading={registryEntry.label}
          message={RULES_CONFIG_NOT_IMPLEMENTED_MESSAGE}
        />
      )}
    </HomebrewDetailShell>
  )
}
