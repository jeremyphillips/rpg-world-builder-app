import * as React from 'react'
import { useWatch, type UseFormReturn } from 'react-hook-form'

import type { CharacterBuildContext } from '@rpg/contracts'
import { Button, SelectionSummaryCard } from '@rpg/ui'
import { mapSetupSummaryRowModelsToProps, type SetupSummaryEditTarget } from '@/lib/create-setup'
import { useCreateFlowFormDensity, CREATE_FLOW_FORM_DENSITY } from '@/lib/create-flow'
import {
  FormShellSubmitButton,
  TabbedForm,
  type TabbedFormTab,
  type TrailingFieldActionConfig,
} from '@rpg/ui/form'

import { useSubmitHandler } from '@/lib/use-submit-handler'

import { useCreateNpc } from '../../hooks/use-create-npc'
import { useQuickNpcNameTrailingAction } from '../../hooks/use-quick-npc-name-trailing-action'
import { isQuickNpcSetupStillValid } from '../../lib/quick-npc/quick-npc-authoring-validation.lib'
import { buildQuickNpcAuthoringCreateInput } from '../../lib/quick-npc/quick-npc-authoring-submit.lib'
import { formatQuickNpcCreationError } from '../../lib/quick-npc/quick-npc-create'
import { createQuickNpcFormValueSyncs } from '../../lib/quick-npc/quick-npc-form-sync'
import {
  buildQuickNpcDetailsFields,
  buildQuickNpcRequirementsFields,
  buildQuickNpcTabs,
  countQuickNpcConfiguredRequirements,
  quickNpcAuthoringTabDefaultValues,
  quickNpcAuthoringTabSchema,
  type QuickNpcAuthoringTabValues,
  type QuickNpcSetupValues,
} from '../../lib/quick-npc/quick-npc-form-fields'
import {
  QUICK_NPC_SETUP_CHANGE_LABEL,
  QUICK_NPC_SETUP_SUMMARY_EYEBROW,
  resolveQuickNpcSetupSummaryRows,
} from '../../lib/quick-npc/quick-npc-create-modal-setup.lib'
import {
  QUICK_NPC_GENERATE_NAME_LABEL,
  resolveQuickNpcNameGenerationSupport,
} from '../../lib/quick-npc/quick-npc-name-generation'
import { buildQuickNpcRequirementOptionSets } from '../../lib/quick-npc/quick-npc-requirement-options.lib'
import { QuickNpcRequirementsFields } from './quick-npc-requirements-fields'
import {
  QUICK_NPC_CREATE_SUBMIT_LABEL,
  type QuickNpcCreateContext,
} from '../../lib/quick-npc/quick-npc-create-context'

export { QUICK_NPC_CREATE_SUBMIT_LABEL } from '../../lib/quick-npc/quick-npc-create-context'
export type { QuickNpcCreateFormOrganization } from '../../lib/quick-npc/quick-npc-create-context'

export const QUICK_NPC_CREATE_FALLBACK_ERROR = 'Could not create this NPC.' as const

export type QuickNpcAuthoringFormProps = {
  campaignId: string
  buildContext: CharacterBuildContext
  createContext: QuickNpcCreateContext
  setup: QuickNpcSetupValues
  initialValues?: Partial<QuickNpcAuthoringTabValues> | undefined
  onCancel: () => void
  onChangeSetup: () => void
  onSetupSummaryEdit: (target: SetupSummaryEditTarget) => void
  onCreated: (result: { contentType: 'npcs'; id: string }) => void | Promise<void>
  onPendingChange?: (pending: boolean) => void
}

function buildQuickNpcAuthoringTabs(args: {
  setup: QuickNpcSetupValues
  buildContext: CharacterBuildContext
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
  configuredCount,
  onTabsChange,
}: {
  form: UseFormReturn<QuickNpcAuthoringTabValues>
  setup: QuickNpcSetupValues
  buildContext: CharacterBuildContext
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
        configuredCount,
        nameTrailingAction: trailingAction,
        nameHint,
      }),
    [buildContext, configuredCount, nameHint, setup, trailingAction],
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
  createContext,
  setup,
  initialValues,
  onCancel,
  onChangeSetup,
  onSetupSummaryEdit,
  onCreated,
  onPendingChange,
}: QuickNpcAuthoringFormProps) {
  const createFlowDensity = useCreateFlowFormDensity()
  const { mutateAsync, isPending, isSuccess } = useCreateNpc()
  const [configuredCount, setConfiguredCount] = React.useState(0)
  const organization =
    createContext.kind === 'organization-member' ? createContext.organization : undefined
  const [tabs, setTabs] = React.useState<TabbedFormTab[]>(() =>
    buildQuickNpcAuthoringTabs({
      setup,
      buildContext,
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
        createContext,
        values: setup,
        context: buildContext,
        titles: organization?.members?.titles ?? [],
      }),
    [buildContext, createContext, organization?.members?.titles, setup],
  )

  const { onSubmit, formError } = useSubmitHandler<QuickNpcAuthoringTabValues>({
    submit: async (tabValues) => {
      if (!isQuickNpcSetupStillValid(setup, buildContext)) {
        onChangeSetup()
        return
      }

      const input = buildQuickNpcAuthoringCreateInput({
        createContext,
        setup,
        tabValues,
        buildContext,
      })

      const npc = await mutateAsync({ campaignId, input })
      await onCreated({ contentType: 'npcs', id: npc.character.id })
    },
    fallbackMessage: QUICK_NPC_CREATE_FALLBACK_ERROR,
    mapError: formatQuickNpcCreationError,
  })

  return (
    <TabbedForm<QuickNpcAuthoringTabValues>
      key={`${setup.speciesId}:${setup.classId}:${setup.level}:${requirementCategoryKey}`}
      density={createFlowDensity ?? CREATE_FLOW_FORM_DENSITY}
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
            configuredCount={configuredCount}
            onTabsChange={setTabs}
          />
          <RequirementCountWatcher
            form={form}
            fallback={defaultValues}
            onConfiguredCountChange={setConfiguredCount}
          />
          <SelectionSummaryCard
            eyebrow={QUICK_NPC_SETUP_SUMMARY_EYEBROW}
            rows={mapSetupSummaryRowModelsToProps({
              rows: setupSummaryRows,
              changeLabel: QUICK_NPC_SETUP_CHANGE_LABEL,
              onEdit: onSetupSummaryEdit,
            })}
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
