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
  buildRulesConfigFields,
  mapRulesetPatchToRulesValues,
  resolveRulesSchema,
  type RulesValues,
  useCanManageCampaign,
} from '@/features/campaign'

import { RulesConfigFieldNav } from '../components/rules-config-field-nav.client'
import { buildActiveCreatureTypeFieldOptions } from '../lib/creature-type-vocabulary'
import { disableFormItems } from '../lib/disable-form-items'
import { findRulesConfigEntry } from '../lib/rules-config-registry'
import { useCreatureTypeVocabulary } from '../hooks/use-creature-type-vocabulary'
import { usePatchCharacterCreationMutation } from '../hooks/use-patch-character-creation-mutation'
import { useRulesetPatch } from '../hooks/use-ruleset-patch'

const UNKNOWN_RULES_CONFIG_MESSAGE = 'This rules configuration page is not available.'

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

/** Shared rules configuration detail — anchor nav and character configuration form. */
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

  return (
    <WidePage spacing="list">
      <div className="flex flex-col gap-6 lg:flex-row">
        <RulesConfigFieldNav />
        <div className="mx-auto min-w-0 w-full max-w-xl flex-1">
          <CharacterConfigurationForm campaignId={campaignId} />
        </div>
      </div>
    </WidePage>
  )
}
