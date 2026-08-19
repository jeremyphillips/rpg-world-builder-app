'use client'

import * as React from 'react'
import { useWatch, type UseFormReturn } from 'react-hook-form'

import {
  resolveOrganizationMembershipMetadata,
  type CampaignNpcDetail,
  type CharacterBuildContext,
  type OrganizationFunction,
  type OrganizationMembershipTitleDefinition,
  type OrganizationPractice,
  type OrganizationDomain,
  type OrganizationForm,
} from '@rpg/contracts'
import { Button } from '@rpg/ui'
import { SetupSummaryCard, SetupSummaryCardChangeAction } from '@/lib/create-setup'
import {
  FormShellSubmitButton,
  TabbedForm,
  type TabbedFormTab,
  type TrailingFieldActionConfig,
} from '@rpg/ui/form'

import { useSubmitHandler } from '@/lib/use-submit-handler'

import { titleFromMembershipRadioValue } from '../../components/connections/organization-membership-title-field.lib'
import { useCreateNpc } from '../hooks/use-create-npc'
import { useQuickNpcNameTrailingAction } from '../hooks/use-quick-npc-name-trailing-action.client'
import { isQuickNpcSetupStillValid } from '../lib/quick-npc-authoring-validation.lib'
import { buildQuickNpcCreateInput, formatQuickNpcCreationError } from '../lib/quick-npc-create'
import { createQuickNpcFormValueSyncs } from '../lib/quick-npc-form-sync'
import {
  buildQuickNpcConstraints,
  buildQuickNpcDetailsFields,
  buildQuickNpcRequirementsFields,
  buildQuickNpcSeed,
  buildQuickNpcTabs,
  countQuickNpcConfiguredRequirements,
  mergeQuickNpcAuthoringValues,
  quickNpcAuthoringTabDefaultValues,
  quickNpcAuthoringTabSchema,
  type QuickNpcAuthoringTabValues,
  type QuickNpcSetupValues,
} from '../lib/quick-npc-form-fields'
import {
  QUICK_NPC_AUTHORING_SETUP_CHANGE_ARIA_LABEL,
  QUICK_NPC_SETUP_CHANGE_LABEL,
  QUICK_NPC_SETUP_SUMMARY_EYEBROW,
  resolveQuickNpcSetupSummaryRows,
} from '../lib/quick-npc-create-modal-setup.lib'
import {
  QUICK_NPC_GENERATE_NAME_LABEL,
  resolveQuickNpcNameGenerationSupport,
} from '../lib/quick-npc-name-generation'
import { buildQuickNpcRequirementOptionSets } from '../lib/quick-npc-requirement-options.lib'
import { QuickNpcRequirementsFields } from './quick-npc-requirements-fields.client'

export const QUICK_NPC_CREATE_SUBMIT_LABEL = 'Create NPC' as const
export const QUICK_NPC_CREATE_FALLBACK_ERROR = 'Could not create this NPC.' as const

export type QuickNpcCreateFormOrganization = {
  id: string
  name: string
  organizationDomain: OrganizationDomain
  organizationForm?: OrganizationForm
  functions?: readonly OrganizationFunction[]
  practices?: readonly OrganizationPractice[]
  members?: {
    classAffinityIds?: readonly string[]
    speciesAffinityIds?: readonly string[]
    titles?: readonly OrganizationMembershipTitleDefinition[]
  }
}

export type QuickNpcAuthoringFormProps = {
  campaignId: string
  buildContext: CharacterBuildContext
  organization: QuickNpcCreateFormOrganization
  setup: QuickNpcSetupValues
  initialValues?: Partial<QuickNpcAuthoringTabValues> | undefined
  onCancel: () => void
  onChangeSetup: () => void
  onCreated: (npc: CampaignNpcDetail) => void | Promise<void>
  onPendingChange?: (pending: boolean) => void
}

function buildQuickNpcAuthoringTabs(args: {
  setup: QuickNpcSetupValues
  buildContext: CharacterBuildContext
  organization: QuickNpcCreateFormOrganization
  configuredCount: number
  nameTrailingAction?: TrailingFieldActionConfig
  nameHint?: string
}): TabbedFormTab[] {
  const optionSets = buildQuickNpcRequirementOptionSets({
    setup: args.setup,
    context: args.buildContext,
  })
  const hasRequirements = optionSets.weapons.length > 0 || optionSets.spells.length > 0
  const generationSupport = resolveQuickNpcNameGenerationSupport({
    speciesId: args.setup.speciesId,
    context: args.buildContext,
  })

  const nameTrailingAction =
    args.nameTrailingAction ??
    ({
      label: QUICK_NPC_GENERATE_NAME_LABEL,
      onAction: () => {},
      disabled: !args.setup.speciesId || !generationSupport.enabled,
    } satisfies TrailingFieldActionConfig)

  const nameHint =
    args.nameHint ??
    (generationSupport.disabledReason && !generationSupport.enabled
      ? generationSupport.disabledReason
      : undefined)

  return buildQuickNpcTabs({
    detailsFields: buildQuickNpcDetailsFields({
      nameTrailingAction,
      nameHint,
    }),
    requirementsFields: hasRequirements ? buildQuickNpcRequirementsFields() : [],
    configuredCount: args.configuredCount,
    requirementsHeader: hasRequirements ? (
      <QuickNpcRequirementsFields optionSets={optionSets} />
    ) : undefined,
  })
}

function QuickNpcAuthoringTabsSync({
  form,
  setup,
  buildContext,
  organization,
  configuredCount,
  onTabsChange,
}: {
  form: UseFormReturn<QuickNpcAuthoringTabValues>
  setup: QuickNpcSetupValues
  buildContext: CharacterBuildContext
  organization: QuickNpcCreateFormOrganization
  configuredCount: number
  onTabsChange: (tabs: TabbedFormTab[]) => void
}) {
  const { trailingAction, nameHint } = useQuickNpcNameTrailingAction({
    speciesId: setup.speciesId,
    buildContext,
    form,
  })

  const tabs = React.useMemo(
    () =>
      buildQuickNpcAuthoringTabs({
        setup,
        buildContext,
        organization,
        configuredCount,
        nameTrailingAction: trailingAction,
        nameHint,
      }),
    [buildContext, configuredCount, nameHint, organization, setup, trailingAction],
  )

  React.useLayoutEffect(() => {
    onTabsChange(tabs)
  }, [onTabsChange, tabs])

  return null
}

function RequirementCountWatcher({
  form,
  fallback,
  onConfiguredCountChange,
}: {
  form: UseFormReturn<QuickNpcAuthoringTabValues>
  fallback: Pick<QuickNpcAuthoringTabValues, 'requiredWeaponIds' | 'requiredSpellIds'>
  onConfiguredCountChange: (count: number) => void
}) {
  const requiredWeaponIds = useWatch({
    control: form.control,
    name: 'requiredWeaponIds',
    defaultValue: fallback.requiredWeaponIds,
  })
  const requiredSpellIds = useWatch({
    control: form.control,
    name: 'requiredSpellIds',
    defaultValue: fallback.requiredSpellIds,
  })

  const configuredCount = countQuickNpcConfiguredRequirements({
    requiredWeaponIds: requiredWeaponIds ?? [],
    requiredSpellIds: requiredSpellIds ?? [],
  })

  React.useEffect(() => {
    onConfiguredCountChange(configuredCount)
  }, [configuredCount, onConfiguredCountChange])

  return null
}

/**
 * Quick NPC authoring body — TabbedForm Details / Requirements after setup.
 */
export function QuickNpcAuthoringForm({
  campaignId,
  buildContext,
  organization,
  setup,
  initialValues,
  onCancel,
  onChangeSetup,
  onCreated,
  onPendingChange,
}: QuickNpcAuthoringFormProps) {
  const { mutateAsync, isPending, isSuccess } = useCreateNpc()
  const [configuredCount, setConfiguredCount] = React.useState(0)
  const [tabs, setTabs] = React.useState<TabbedFormTab[]>(() =>
    buildQuickNpcAuthoringTabs({
      setup,
      buildContext,
      organization,
      configuredCount: 0,
    }),
  )

  React.useEffect(() => {
    onPendingChange?.(isPending)
  }, [isPending, onPendingChange])

  const schema = React.useMemo(() => quickNpcAuthoringTabSchema(), [])
  const valueSyncs = React.useMemo(() => createQuickNpcFormValueSyncs(buildContext), [buildContext])

  const defaultValues = React.useMemo(
    () => ({
      ...quickNpcAuthoringTabDefaultValues,
      ...initialValues,
    }),
    [initialValues],
  )

  const requirementCategoryKey = React.useMemo(() => {
    const optionSets = buildQuickNpcRequirementOptionSets({ setup, context: buildContext })
    return `${optionSets.weapons.length}:${optionSets.spells.length}`
  }, [buildContext, setup])

  const setupSummaryRows = React.useMemo(
    () =>
      resolveQuickNpcSetupSummaryRows({
        values: setup,
        context: buildContext,
        titles: organization.members?.titles ?? [],
      }),
    [buildContext, organization.members?.titles, setup],
  )

  const { onSubmit, formError } = useSubmitHandler<QuickNpcAuthoringTabValues>({
    submit: async (tabValues) => {
      if (!isQuickNpcSetupStillValid(setup, buildContext)) {
        onChangeSetup()
        return
      }

      const values = mergeQuickNpcAuthoringValues(setup, tabValues)
      const membershipMetadata = resolveOrganizationMembershipMetadata({
        titles: organization.members?.titles ?? [],
        selectedTitle: titleFromMembershipRadioValue(setup.membershipTitle ?? ''),
      })

      const constraints = buildQuickNpcConstraints(values)
      const input = buildQuickNpcCreateInput({
        seed: buildQuickNpcSeed(values),
        context: buildContext,
        ...(constraints ? { constraints } : {}),
        membership: {
          organizationId: organization.id,
          ...(membershipMetadata.title !== undefined ? { title: membershipMetadata.title } : {}),
          ...(membershipMetadata.priority !== undefined
            ? { priority: membershipMetadata.priority }
            : {}),
        },
      })

      const npc = await mutateAsync({ campaignId, input })
      await onCreated(npc)
    },
    fallbackMessage: QUICK_NPC_CREATE_FALLBACK_ERROR,
    mapError: formatQuickNpcCreationError,
  })

  return (
    <TabbedForm<QuickNpcAuthoringTabValues>
      key={`${setup.speciesId}:${setup.classId}:${setup.level}:${requirementCategoryKey}`}
      schema={schema}
      tabs={tabs}
      defaultValues={defaultValues}
      onSubmit={onSubmit}
      formError={formError ?? null}
      valueSyncs={valueSyncs}
      stickyChrome={false}
      externalFooter
      header={(form) => (
        <>
          <QuickNpcAuthoringTabsSync
            form={form}
            setup={setup}
            buildContext={buildContext}
            organization={organization}
            configuredCount={configuredCount}
            onTabsChange={setTabs}
          />
          <RequirementCountWatcher
            form={form}
            fallback={defaultValues}
            onConfiguredCountChange={setConfiguredCount}
          />
          <SetupSummaryCard
            eyebrow={QUICK_NPC_SETUP_SUMMARY_EYEBROW}
            rows={setupSummaryRows}
            cardAction={
              <SetupSummaryCardChangeAction
                changeLabel={QUICK_NPC_SETUP_CHANGE_LABEL}
                ariaLabel={QUICK_NPC_AUTHORING_SETUP_CHANGE_ARIA_LABEL}
                onChange={onChangeSetup}
              />
            }
          />
        </>
      )}
      footer={() => (
        <>
          <Button type="button" variant="outline" disabled={isPending} onClick={onCancel}>
            Cancel
          </Button>
          <FormShellSubmitButton disabled={isPending || isSuccess}>
            {QUICK_NPC_CREATE_SUBMIT_LABEL}
          </FormShellSubmitButton>
        </>
      )}
    />
  )
}
