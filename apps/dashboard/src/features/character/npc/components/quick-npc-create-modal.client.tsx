'use client'

import * as React from 'react'

import type { CampaignNpcDetail, CharacterBuildContext } from '@rpg/contracts'
import { Button, DialogPanelActionRow, usePendingAwareOpenChange } from '@rpg/ui'
import { FormShellFooterScope, FormShellFooterSlot } from '@rpg/ui/form'

import { CreateModalShell } from '@/lib/create-flow'

import {
  createQuickNpcSetupDefaultValues,
  type QuickNpcAuthoringTabValues,
  type QuickNpcSetupValues,
} from '../lib/quick-npc-form-fields'
import { applyQuickNpcSetupValueChange } from '../lib/quick-npc-setup-value-change.lib'
import {
  QUICK_NPC_ORG_MEMBER_SETUP_DESCRIPTION,
  QUICK_NPC_ORG_MEMBER_SETUP_HEADLINE,
  resolveQuickNpcSetupModel,
} from '../lib/quick-npc-create-modal-setup.lib'
import {
  QuickNpcAuthoringForm,
  type QuickNpcCreateFormOrganization,
} from './quick-npc-authoring-form.client'
import { QuickNpcCreateSetupPhase } from './quick-npc-create-setup-phase.client'

export type { QuickNpcCreateFormOrganization }

export const QUICK_NPC_CREATE_TITLE = QUICK_NPC_ORG_MEMBER_SETUP_HEADLINE

export type QuickNpcCreateModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  campaignId: string
  buildContext: CharacterBuildContext
  organization: QuickNpcCreateFormOrganization
  /** Called when the user dismisses authoring — parent should restore the add drawer. */
  onCancel: () => void
  onCreated: (npc: CampaignNpcDetail) => void | Promise<void>
}

type QuickNpcCreateModalPhase = 'setup' | 'authoring'

type QuickNpcCreateModalState = {
  phase: QuickNpcCreateModalPhase
  setupValues: QuickNpcSetupValues
  authoringValues?: Partial<QuickNpcAuthoringTabValues>
}

function createInitialState(buildContext: CharacterBuildContext): QuickNpcCreateModalState {
  return {
    phase: 'setup',
    setupValues: createQuickNpcSetupDefaultValues(buildContext),
  }
}

function QuickNpcCreateModalSession({
  open,
  onOpenChange,
  campaignId,
  buildContext,
  organization,
  onCancel,
  onCreated,
}: QuickNpcCreateModalProps) {
  const [state, setState] = React.useState(() => createInitialState(buildContext))
  const [authoringPending, setAuthoringPending] = React.useState(false)
  const { trustedClose } = usePendingAwareOpenChange({
    pending: authoringPending,
    onOpenChange,
  })

  const setupModel = React.useMemo(
    () =>
      resolveQuickNpcSetupModel({
        context: buildContext,
        values: state.setupValues,
        titles: organization.members?.titles ?? [],
        members: {
          classAffinityIds: organization.members?.classAffinityIds,
          speciesAffinityIds: organization.members?.speciesAffinityIds,
        },
      }),
    [
      buildContext,
      organization.members?.classAffinityIds,
      organization.members?.speciesAffinityIds,
      organization.members?.titles,
      state.setupValues,
    ],
  )

  const requestCancel = React.useCallback(() => {
    if (authoringPending) return
    onCancel()
  }, [authoringPending, onCancel])

  const handleDismiss = React.useCallback(
    (nextOpen: boolean) => {
      if (nextOpen) {
        onOpenChange(true)
        return
      }
      requestCancel()
    },
    [onOpenChange, requestCancel],
  )

  const handleSetupValueChange = React.useCallback(
    (event: Parameters<typeof applyQuickNpcSetupValueChange>[0]['event']) => {
      setState((current) => ({
        ...current,
        setupValues: applyQuickNpcSetupValueChange({
          values: current.setupValues,
          event,
          context: buildContext,
          titles: organization.members?.titles ?? [],
          organizationClassAffinityIds: organization.members?.classAffinityIds,
        }),
      }))
    },
    [buildContext, organization.members?.classAffinityIds, organization.members?.titles],
  )

  const handleContinueFromSetup = React.useCallback((values: QuickNpcSetupValues) => {
    setState((current) => ({
      ...current,
      phase: 'authoring',
      setupValues: values,
      authoringValues: {
        requiredWeaponIds: [],
        requiredSpellIds: [],
      },
    }))
  }, [])

  const handleChangeSetup = React.useCallback(() => {
    setState((current) => ({
      ...current,
      phase: 'setup',
      authoringValues: {
        ...current.authoringValues,
        requiredWeaponIds: [],
        requiredSpellIds: [],
      },
    }))
  }, [])

  const handleAuthoringCreated = React.useCallback(
    async (npc: CampaignNpcDetail) => {
      await onCreated(npc)
      trustedClose()
    },
    [onCreated, trustedClose],
  )

  return (
    <FormShellFooterScope>
      <CreateModalShell
        open={open}
        onOpenChange={handleDismiss}
        headline={
          state.phase === 'setup' ? QUICK_NPC_ORG_MEMBER_SETUP_HEADLINE : QUICK_NPC_CREATE_TITLE
        }
        description={
          state.phase === 'setup'
            ? QUICK_NPC_ORG_MEMBER_SETUP_DESCRIPTION
            : `Create a new NPC as a member of ${organization.name}.`
        }
        contentMode={state.phase === 'setup' ? 'scroll' : 'managed'}
        footer={
          state.phase === 'setup' ? (
            <DialogPanelActionRow>
              <Button type="button" variant="outline" onClick={requestCancel}>
                Cancel
              </Button>
              <Button
                type="button"
                disabled={!setupModel.canContinue}
                onClick={() => {
                  if (!setupModel.canContinue) return
                  handleContinueFromSetup(state.setupValues)
                }}
              >
                Continue
              </Button>
            </DialogPanelActionRow>
          ) : (
            <FormShellFooterSlot />
          )
        }
      >
        {state.phase === 'setup' ? (
          <QuickNpcCreateSetupPhase
            buildContext={buildContext}
            organization={organization}
            setupValues={state.setupValues}
            onSetupValueChange={handleSetupValueChange}
          />
        ) : (
          <QuickNpcAuthoringForm
            key={`${state.setupValues.speciesId}:${state.setupValues.classId}:${state.setupValues.level}`}
            campaignId={campaignId}
            buildContext={buildContext}
            organization={organization}
            setup={state.setupValues}
            initialValues={state.authoringValues}
            onCancel={requestCancel}
            onChangeSetup={handleChangeSetup}
            onCreated={handleAuthoringCreated}
            onPendingChange={setAuthoringPending}
          />
        )}
      </CreateModalShell>
    </FormShellFooterScope>
  )
}

/**
 * Quick NPC creation modal — setup then TabbedForm authoring. Cancel/X/Escape during
 * authoring returns to the add-member drawer; success closes all overlays.
 */
export function QuickNpcCreateModal(props: QuickNpcCreateModalProps) {
  if (!props.open) return null
  return <QuickNpcCreateModalSession key={props.organization.id} {...props} />
}
