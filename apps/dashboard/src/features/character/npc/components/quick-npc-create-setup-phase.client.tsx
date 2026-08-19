'use client'

import * as React from 'react'

import type { CharacterBuildContext } from '@rpg/contracts'

import {
  CreateSetupPanel,
  createSetupModalBodyClasses,
  useCreateSetupSequence,
  type CreateSetupValueChangeEvent,
} from '@/lib/create-setup'
import { cn } from '@rpg/ui'

import type { QuickNpcSetupValues } from '../lib/quick-npc-form-fields'
import {
  isQuickNpcBuildCardVisible,
  resolveQuickNpcBuildCardModel,
} from '../lib/quick-npc-build-card.lib'
import {
  buildQuickNpcCreateSetupSets,
  QUICK_NPC_SETUP_CHANGE_LABEL,
} from '../lib/quick-npc-create-modal-setup.lib'
import type { QuickNpcCreateFormOrganization } from './quick-npc-authoring-form.client'
import { QuickNpcBuildCard } from './quick-npc-build-card.client'
import {
  quickNpcBuildCardSectionClasses,
  quickNpcBuildCardSetupOffsetClasses,
} from './quick-npc-build-card.variants'

export type QuickNpcCreateSetupPhaseProps = {
  buildContext: CharacterBuildContext
  organization: QuickNpcCreateFormOrganization
  setupValues: QuickNpcSetupValues
  onSetupValueChange: (event: CreateSetupValueChangeEvent) => void
}

export function QuickNpcCreateSetupPhase({
  buildContext,
  organization,
  setupValues,
  onSetupValueChange,
}: QuickNpcCreateSetupPhaseProps) {
  const setupSets = React.useMemo(
    () =>
      buildQuickNpcCreateSetupSets({
        context: buildContext,
        values: setupValues,
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
      setupValues,
    ],
  )

  const sequenceModel = useCreateSetupSequence(setupSets)

  const buildCardModel = React.useMemo(
    () =>
      resolveQuickNpcBuildCardModel({
        context: buildContext,
        values: setupValues,
        titles: organization.members?.titles ?? [],
        members: {
          classAffinityIds: organization.members?.classAffinityIds,
        },
      }),
    [
      buildContext,
      organization.members?.classAffinityIds,
      organization.members?.titles,
      setupValues,
    ],
  )

  const showBuildCard = isQuickNpcBuildCardVisible({
    buildCardModel,
    isEditingUpstream: sequenceModel.isEditingUpstream,
  })

  return (
    <div className={createSetupModalBodyClasses}>
      <CreateSetupPanel
        className="contents"
        sets={setupSets}
        model={sequenceModel}
        changeLabel={QUICK_NPC_SETUP_CHANGE_LABEL}
        onSetupValueChange={onSetupValueChange}
      />
      {showBuildCard && buildCardModel ? (
        <QuickNpcBuildCard
          className={cn(quickNpcBuildCardSectionClasses, quickNpcBuildCardSetupOffsetClasses)}
          model={buildCardModel}
          onClassChange={(classId) =>
            onSetupValueChange({
              setId: 'classId',
              previousValue: setupValues.classId,
              nextValue: classId,
              invalidatedSetIds: [],
            })
          }
          onLevelChange={(level) =>
            onSetupValueChange({
              setId: 'level',
              previousValue: setupValues.level,
              nextValue: level,
              invalidatedSetIds: [],
            })
          }
        />
      ) : null}
    </div>
  )
}
