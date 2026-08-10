'use client'

import * as React from 'react'
import { createElement } from 'react'
import { useWatch, type UseFormReturn } from 'react-hook-form'

import {
  resolveOrganizationMembershipMetadata,
  type CampaignNpcDetail,
  type CharacterBuildContext,
  type OrganizationKind,
} from '@rpg/contracts'
import { Button, dialogPanelActionRowClasses } from '@rpg/ui'
import { TabbedForm } from '@rpg/ui/form'

import { useSubmitHandler } from '@/lib/use-submit-handler'

import { titleFromMembershipRadioValue } from '../../components/connections/organization-membership-title-field.lib'
import { useCreateNpc } from '../hooks/use-create-npc'
import { isQuickNpcSetupStillValid } from '../lib/quick-npc-authoring-validation.lib'
import { buildQuickNpcCreateInput, formatQuickNpcCreationError } from '../lib/quick-npc-create'
import type { QuickNpcSetupSummaryEntry } from '../lib/quick-npc-create-modal-setup.lib'
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
  resolveQuickNpcMaxLevel,
  resolveQuickNpcRequirementCategories,
  type QuickNpcAuthoringTabValues,
  type QuickNpcSetupValues,
} from '../lib/quick-npc-form-fields'
import { QuickNpcNameField } from './quick-npc-name-field.client'
import { QuickNpcSetupSummary } from './quick-npc-setup-summary.client'

export const QUICK_NPC_CREATE_SUBMIT_LABEL = 'Create NPC' as const
export const QUICK_NPC_CREATE_FALLBACK_ERROR = 'Could not create this NPC.' as const

export type QuickNpcCreateFormOrganization = {
  id: string
  name: string
  organizationKind: OrganizationKind
  organizationSubtype?: string
}

export type QuickNpcAuthoringFormProps = {
  campaignId: string
  buildContext: CharacterBuildContext
  organization: QuickNpcCreateFormOrganization
  setup: QuickNpcSetupValues
  setupSummary: readonly QuickNpcSetupSummaryEntry[]
  initialValues?: Partial<QuickNpcAuthoringTabValues> | undefined
  onCancel: () => void
  onChangeSetup: () => void
  onCreated: (npc: CampaignNpcDetail) => void | Promise<void>
  onPendingChange?: (pending: boolean) => void
}

function buildAuthoringTabs(args: {
  setup: QuickNpcSetupValues
  buildContext: CharacterBuildContext
  organization: QuickNpcCreateFormOrganization
  configuredCount: number
}) {
  const requirementCategories = resolveQuickNpcRequirementCategories({
    setup: args.setup,
    context: args.buildContext,
  })

  return buildQuickNpcTabs({
    detailsFields: buildQuickNpcDetailsFields({
      membership: {
        kind: args.organization.organizationKind,
        ...(args.organization.organizationSubtype !== undefined
          ? { subtype: args.organization.organizationSubtype }
          : {}),
      },
      nameFieldSlot: {
        kind: 'slot',
        name: '_quickNpcNameField',
        render: () =>
          createElement(QuickNpcNameField, {
            speciesId: args.setup.speciesId,
            buildContext: args.buildContext,
          }),
      },
    }),
    requirementsFields: buildQuickNpcRequirementsFields(requirementCategories),
    configuredCount: args.configuredCount,
  })
}

function RequirementCountWatcher({
  form,
  fallback,
  onConfiguredCountChange,
}: {
  form: UseFormReturn<QuickNpcAuthoringTabValues>
  fallback: Pick<QuickNpcAuthoringTabValues, 'requiredWeaponId' | 'requiredSpellId'>
  onConfiguredCountChange: (count: number) => void
}) {
  const requiredWeaponId = useWatch({
    control: form.control,
    name: 'requiredWeaponId',
    defaultValue: fallback.requiredWeaponId,
  })
  const requiredSpellId = useWatch({
    control: form.control,
    name: 'requiredSpellId',
    defaultValue: fallback.requiredSpellId,
  })

  const configuredCount = countQuickNpcConfiguredRequirements({
    requiredWeaponId: requiredWeaponId ?? '',
    requiredSpellId: requiredSpellId ?? '',
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
  setupSummary,
  initialValues,
  onCancel,
  onChangeSetup,
  onCreated,
  onPendingChange,
}: QuickNpcAuthoringFormProps) {
  const { mutateAsync, isPending, isSuccess } = useCreateNpc()
  const [configuredCount, setConfiguredCount] = React.useState(0)

  React.useEffect(() => {
    onPendingChange?.(isPending)
  }, [isPending, onPendingChange])

  const maxLevel = resolveQuickNpcMaxLevel(buildContext)
  const schema = React.useMemo(() => quickNpcAuthoringTabSchema(), [])
  const valueSyncs = React.useMemo(() => createQuickNpcFormValueSyncs(buildContext), [buildContext])

  const defaultValues = React.useMemo(
    () => ({
      ...quickNpcAuthoringTabDefaultValues,
      ...setup,
      ...initialValues,
    }),
    [initialValues, setup],
  )

  const tabs = React.useMemo(
    () =>
      buildAuthoringTabs({
        setup,
        buildContext,
        organization,
        configuredCount,
      }),
    [buildContext, configuredCount, organization, setup],
  )

  const requirementCategoryKey = React.useMemo(() => {
    const categories = resolveQuickNpcRequirementCategories({ setup, context: buildContext })
    return `${categories.weapons.length}:${categories.spells.length}`
  }, [buildContext, setup])

  const { onSubmit, formError } = useSubmitHandler<QuickNpcAuthoringTabValues>({
    submit: async (tabValues) => {
      if (!isQuickNpcSetupStillValid(setup, buildContext, maxLevel)) {
        onChangeSetup()
        return
      }

      const values = mergeQuickNpcAuthoringValues(setup, tabValues)
      const membershipMetadata = resolveOrganizationMembershipMetadata({
        kind: organization.organizationKind,
        ...(organization.organizationSubtype !== undefined
          ? { subtype: organization.organizationSubtype }
          : {}),
        selectedTitle: titleFromMembershipRadioValue(values.membershipTitle),
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
      header={(form) => (
        <>
          <RequirementCountWatcher
            form={form}
            fallback={defaultValues}
            onConfiguredCountChange={setConfiguredCount}
          />
          <QuickNpcSetupSummary entries={setupSummary} onChange={onChangeSetup} />
        </>
      )}
      footer={() => (
        <div className={dialogPanelActionRowClasses}>
          <Button type="button" variant="outline" disabled={isPending} onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending || isSuccess}>
            {QUICK_NPC_CREATE_SUBMIT_LABEL}
          </Button>
        </div>
      )}
    />
  )
}
