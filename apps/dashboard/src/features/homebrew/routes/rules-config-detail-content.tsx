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
  buildCharacterConfigurationNavigation,
  buildMechanicsConfigFields,
  buildMechanicsPatchInput,
  mapRulesetPatchToMechanicsValues,
  MECHANICS_CONFIGURATION_SECTIONS,
  mechanicsValuesSchema,
  type MechanicsValues,
  type RulesValues,
  useCanManageCampaign,
} from '@/features/campaign'

import {
  buildAttackResolutionModeFieldOptions,
  buildEditionPresetFieldOptions,
  useAttackResolutionModeVocabulary,
  useEditionPresetVocabulary,
} from '@/features/vocabulary'

import { RulesConfigFieldNav } from '../components/rules-config-field-nav.client'
import { createRulesConfigSaveFooter } from '../components/rules-config-save-footer'
import { useCharacterConfigurationRulesForm } from '../hooks/use-character-configuration-rules-form.client'
import { useRulesConfigNavScrollSpy } from '../hooks/use-rules-config-nav-scroll-spy.client'
import { disableFormItems } from '@/lib/disable-form-items'
import { HomebrewDetailFallback } from '../lib/detail/homebrew-detail-fallback'
import { HomebrewDetailMain } from '../lib/detail/homebrew-detail-main'
import { HomebrewDetailShell } from '../lib/detail/homebrew-detail-shell'
import { findRulesConfigEntry, type RulesConfigId } from '../lib/hub/rules-config-registry'
import { usePatchMechanicsMutation } from '../hooks/use-patch-mechanics-mutation'
import { useRulesetPatch } from '../hooks/use-ruleset-patch'

const UNKNOWN_RULES_CONFIG_MESSAGE = 'This rules configuration page is not available.'

const RULES_CONFIG_NOT_IMPLEMENTED_MESSAGE = 'This rules configuration page is not available yet.'

const RULES_CONFIG_NAV: Record<
  RulesConfigId,
  {
    navLabel: string
    mobileSelectLabel: string
  }
> = {
  'character-configuration': {
    navLabel: 'Character configuration sections',
    mobileSelectLabel: 'Character configuration section',
  },
  mechanics: {
    navLabel: 'Mechanics configuration sections',
    mobileSelectLabel: 'Mechanics configuration section',
  },
}

function CharacterConfigurationRulesConfigDetail({ campaignId }: { campaignId: string }) {
  const navSections = useMemo(() => buildCharacterConfigurationNavigation(), [])
  const { activeSectionId, activeLeafId } = useRulesConfigNavScrollSpy(navSections)
  const nav = RULES_CONFIG_NAV['character-configuration']

  return (
    <HomebrewDetailShell
      nav={
        <RulesConfigFieldNav
          sections={navSections}
          navLabel={nav.navLabel}
          mobileSelectLabel={nav.mobileSelectLabel}
          activeSectionId={activeSectionId}
          activeLeafId={activeLeafId}
        />
      }
    >
      <CharacterConfigurationForm campaignId={campaignId} />
    </HomebrewDetailShell>
  )
}

function MechanicsRulesConfigDetail({ campaignId }: { campaignId: string }) {
  const nav = RULES_CONFIG_NAV.mechanics

  return (
    <HomebrewDetailShell
      nav={
        <RulesConfigFieldNav
          sections={MECHANICS_CONFIGURATION_SECTIONS}
          navLabel={nav.navLabel}
          mobileSelectLabel={nav.mobileSelectLabel}
        />
      }
    >
      <MechanicsConfigurationForm campaignId={campaignId} />
    </HomebrewDetailShell>
  )
}

export type RulesConfigDetailContentProps = {
  campaignId: string
  configId: string
}

const READ_ONLY_RULES_MESSAGE = 'You can view these rules but only campaign owners can edit them.'

function CharacterConfigurationForm({ campaignId }: { campaignId: string }) {
  const {
    canManage,
    schema,
    fields,
    defaultValues,
    onSubmit,
    formError,
    saveFooter,
    isPending,
    isError,
  } = useCharacterConfigurationRulesForm(campaignId)

  return (
    <PageLoadState
      isPending={isPending}
      isError={isError}
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

  if (!registryEntry.enabled) {
    return (
      <HomebrewDetailShell
        nav={
          <RulesConfigFieldNav
            sections={
              registryEntry.id === 'character-configuration'
                ? buildCharacterConfigurationNavigation()
                : MECHANICS_CONFIGURATION_SECTIONS
            }
            navLabel={nav.navLabel}
            mobileSelectLabel={nav.mobileSelectLabel}
          />
        }
      >
        <HomebrewDetailFallback
          status="disabled"
          heading={registryEntry.label}
          message={RULES_CONFIG_NOT_IMPLEMENTED_MESSAGE}
        />
      </HomebrewDetailShell>
    )
  }

  if (registryEntry.id === 'character-configuration') {
    return <CharacterConfigurationRulesConfigDetail campaignId={campaignId} />
  }

  return <MechanicsRulesConfigDetail campaignId={campaignId} />
}
