import * as React from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { type UseFormReturn } from 'react-hook-form'

import type { CharacterBuildContext } from '@rpg/contracts'
import { Button, SelectionSummaryCard, Text } from '@rpg/ui'
import { mapSetupSummaryRowModelsToProps, type SetupSummaryEditTarget } from '@/lib/create-setup'
import { useCreateFlowFormDensity, CREATE_FLOW_FORM_DENSITY } from '@/lib/create-flow'
import {
  FormShellSubmitButton,
  TabbedForm,
  type TabbedFormTab,
  type TrailingFieldActionConfig,
} from '@rpg/ui/form'

import { useSubmitHandler } from '@/lib/use-submit-handler'

import { useSpeciesNameTrailingAction } from '../../../hooks/use-species-name-trailing-action'
import { useCreateNpc } from '../../hooks/use-create-npc'
import { isQuickNpcSetupStillValid } from '../../lib/quick-npc/quick-npc-authoring-validation.lib'
import { formatQuickNpcCreationError } from '../../lib/quick-npc/quick-npc-create'
import { createQuickNpcFormValueSyncs } from '../../lib/quick-npc/quick-npc-form-sync'
import {
  buildQuickNpcDetailsFields,
  buildQuickNpcRequirementsFields,
  buildQuickNpcTabs,
  QUICK_NPC_GENERATE_NARRATIVE_FIELD_NAME,
  quickNpcAuthoringTabDefaultValues,
  quickNpcAuthoringTabSchema,
  type QuickNpcAuthoringTabFormValues,
  type QuickNpcSetupValues,
} from '../../lib/quick-npc/quick-npc-form-fields'
import {
  QUICK_NPC_SETUP_CHANGE_LABEL,
  QUICK_NPC_SETUP_SUMMARY_EYEBROW,
  resolveQuickNpcSetupSummaryRows,
} from '../../lib/quick-npc/quick-npc-create-modal-setup.lib'
import { resolveCharacterSpeciesNameGenerationSupport } from '../../../lib/naming/character-species-name-generation.lib'
import { generateNameActionIcon } from '../../../lib/naming/species-name-generation-action-icon'
import { GENERATE_NAME_ACTION_LABEL } from '../../../lib/naming/species-name-generation-labels'
import { buildQuickNpcRequirementOptionSets } from '../../lib/quick-npc/quick-npc-requirement-options.lib'
import {
  isQuickNpcNarrativeGenerationFailedError,
  resolveQuickNpcAuthoringCreateInput,
} from '../../lib/quick-npc/quick-npc-narrative-on-create.lib'
import { QuickNpcStartingChoices } from './quick-npc-starting-choices'
import { QuickNpcPreviewNpcButton } from './quick-npc-preview-npc-button'
import {
  quickNpcCreateFooterActionsClasses,
  quickNpcCreateFooterLayoutClasses,
} from './quick-npc-create-footer.variants'
import {
  QUICK_NPC_CREATE_SUBMIT_LABEL,
  type QuickNpcCreateContext,
} from '../../lib/quick-npc/quick-npc-create-context'

export { QUICK_NPC_CREATE_SUBMIT_LABEL } from '../../lib/quick-npc/quick-npc-create-context'
export type { QuickNpcCreateFormOrganization } from '../../lib/quick-npc/quick-npc-create-context'

export const QUICK_NPC_CREATE_FALLBACK_ERROR = 'Could not create this NPC.' as const

export const QUICK_NPC_NARRATIVE_RETRY_LABEL = 'Retry narrative' as const
export const QUICK_NPC_CREATE_WITHOUT_NARRATIVE_LABEL = 'Create without narrative' as const

export type QuickNpcAuthoringFormProps = {
  campaignId: string
  buildContext: CharacterBuildContext
  createContext: QuickNpcCreateContext
  setup: QuickNpcSetupValues
  initialValues?: Partial<QuickNpcAuthoringTabFormValues> | undefined
  onCancel: () => void
  onChangeSetup: () => void
  onSetupSummaryEdit: (target: SetupSummaryEditTarget) => void
  onCreated: (result: { contentType: 'npcs'; id: string }) => void | Promise<void>
  onPendingChange?: (pending: boolean) => void
  previewButtonRef?: React.RefObject<HTMLButtonElement | null>
}

function buildQuickNpcAuthoringTabs(args: {
  setup: QuickNpcSetupValues
  buildContext: CharacterBuildContext
  createContext: QuickNpcCreateContext
  nameTrailingAction?: TrailingFieldActionConfig
  nameHint?: string
}): TabbedFormTab[] {
  const optionSets = buildQuickNpcRequirementOptionSets({
    setup: args.setup,
    context: args.buildContext,
  })
  const generationSupport = resolveCharacterSpeciesNameGenerationSupport({
    speciesId: args.setup.speciesId,
    context: args.buildContext,
  })

  const nameTrailingAction =
    args.nameTrailingAction ??
    ({
      label: GENERATE_NAME_ACTION_LABEL,
      icon: generateNameActionIcon,
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
    requirementsFields: buildQuickNpcRequirementsFields(),
    requirementsHeader: (
      <QuickNpcStartingChoices
        setup={args.setup}
        buildContext={args.buildContext}
        createContext={args.createContext}
        optionSets={optionSets}
      />
    ),
  })
}

function QuickNpcAuthoringTabsSync({
  form,
  setup,
  buildContext,
  createContext,
  onTabsChange,
}: {
  form: UseFormReturn<QuickNpcAuthoringTabFormValues>
  setup: QuickNpcSetupValues
  buildContext: CharacterBuildContext
  createContext: QuickNpcCreateContext
  onTabsChange: (tabs: TabbedFormTab[]) => void
}) {
  const { trailingAction, nameHint } = useSpeciesNameTrailingAction({
    speciesId: setup.speciesId,
    buildContext,
    form,
  })

  const tabs = React.useMemo(
    () =>
      buildQuickNpcAuthoringTabs({
        setup,
        buildContext,
        createContext,
        nameTrailingAction: trailingAction,
        nameHint,
      }),
    [buildContext, createContext, nameHint, setup, trailingAction],
  )

  React.useLayoutEffect(() => {
    onTabsChange(tabs)
  }, [onTabsChange, tabs])

  return null
}

function QuickNpcSubmitPendingSync({
  form,
  onPendingChange,
}: {
  form: UseFormReturn<QuickNpcAuthoringTabFormValues>
  onPendingChange?: (pending: boolean) => void
}) {
  const isSubmitting = form.formState.isSubmitting

  React.useEffect(() => {
    onPendingChange?.(isSubmitting)
  }, [isSubmitting, onPendingChange])

  return null
}

/**
 * Quick NPC authoring body — TabbedForm Details / Starting choices after setup.
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
  previewButtonRef,
}: QuickNpcAuthoringFormProps) {
  const queryClient = useQueryClient()
  const createFlowDensity = useCreateFlowFormDensity()
  const { mutateAsync, isSuccess } = useCreateNpc()
  const organization =
    createContext.kind === 'organization-member' ? createContext.organization : undefined
  const skipNarrativeGenerationRef = React.useRef(false)
  const [showNarrativeRecovery, setShowNarrativeRecovery] = React.useState(false)
  const [tabs, setTabs] = React.useState<TabbedFormTab[]>(() =>
    buildQuickNpcAuthoringTabs({
      setup,
      buildContext,
      createContext,
    }),
  )

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

  const { onSubmit, formError } = useSubmitHandler<QuickNpcAuthoringTabFormValues>({
    submit: async (tabValues) => {
      if (!isQuickNpcSetupStillValid(setup, buildContext)) {
        onChangeSetup()
        return
      }

      const parsed = schema.parse(tabValues)
      const skipNarrativeGeneration = skipNarrativeGenerationRef.current
      skipNarrativeGenerationRef.current = false

      try {
        const input = await resolveQuickNpcAuthoringCreateInput({
          prepareArgs: {
            createContext,
            setup,
            tabValues: parsed,
            buildContext,
          },
          buildContext,
          campaignId,
          queryClient,
          generateNarrativeOnCreate: parsed[QUICK_NPC_GENERATE_NARRATIVE_FIELD_NAME],
          skipNarrativeGeneration,
        })

        setShowNarrativeRecovery(false)
        const npc = await mutateAsync({ campaignId, input })
        await onCreated({ contentType: 'npcs', id: npc.character.id })
      } catch (error) {
        if (isQuickNpcNarrativeGenerationFailedError(error)) {
          setShowNarrativeRecovery(true)
        }
        throw error
      }
    },
    fallbackMessage: QUICK_NPC_CREATE_FALLBACK_ERROR,
    mapError: (error) => {
      if (isQuickNpcNarrativeGenerationFailedError(error)) return error.message
      return formatQuickNpcCreationError(error)
    },
  })

  return (
    <TabbedForm<QuickNpcAuthoringTabFormValues>
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
            createContext={createContext}
            onTabsChange={setTabs}
          />
          <QuickNpcSubmitPendingSync form={form} onPendingChange={onPendingChange} />
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
      footer={(form) => {
        const isSubmitting = form.formState.isSubmitting

        return (
          <>
            {showNarrativeRecovery ? (
              <div className="flex flex-col gap-2 pb-2">
                <Text variant="muted" className="text-sm">
                  Narrative generation failed. Retry or create this NPC without a generated
                  narrative.
                </Text>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    disabled={isSubmitting}
                    onClick={() => {
                      setShowNarrativeRecovery(false)
                      void form.handleSubmit((values) => onSubmit(values, form))()
                    }}
                  >
                    {QUICK_NPC_NARRATIVE_RETRY_LABEL}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isSubmitting}
                    onClick={() => {
                      skipNarrativeGenerationRef.current = true
                      setShowNarrativeRecovery(false)
                      void form.handleSubmit((values) => onSubmit(values, form))()
                    }}
                  >
                    {QUICK_NPC_CREATE_WITHOUT_NARRATIVE_LABEL}
                  </Button>
                </div>
              </div>
            ) : null}
            <div className={quickNpcCreateFooterLayoutClasses()}>
              <QuickNpcPreviewNpcButton
                buttonRef={previewButtonRef}
                buildContext={buildContext}
                createContext={createContext}
                setup={setup}
                authoringValues={form.getValues()}
                disabled={isSubmitting}
              />
              <div className={quickNpcCreateFooterActionsClasses()}>
                <Button type="button" variant="outline" disabled={isSubmitting} onClick={onCancel}>
                  Cancel
                </Button>
                <FormShellSubmitButton disabled={isSubmitting || isSuccess}>
                  {isSubmitting ? 'Creating…' : QUICK_NPC_CREATE_SUBMIT_LABEL}
                </FormShellSubmitButton>
              </div>
            </div>
          </>
        )
      }}
    />
  )
}
