'use client'

import * as React from 'react'

import type { CharacterBuildContext } from '@rpg/contracts'

import {
  CreateSetupPanel,
  createSetupModalBodyClasses,
  type CreateSetupSequenceModel,
  type CreateSetupValueChangeEvent,
} from '@/lib/create-setup'
import { cn } from '@rpg/ui'

import type { QuickNpcCreateContext } from '../lib/quick-npc-create-context'
import { resolveQuickNpcCreateOrganization } from '../lib/quick-npc-create-context'
import type { QuickNpcSetupValues } from '../lib/quick-npc-form-fields'
import {
  isQuickNpcBuildCardVisible,
  resolveQuickNpcBuildCardModel,
} from '../lib/quick-npc-build-card.lib'
import { QUICK_NPC_SETUP_CHANGE_LABEL } from '../lib/quick-npc-create-modal-setup.lib'
import { QuickNpcBuildCard } from './quick-npc-build-card.client'
import {
  quickNpcBuildCardSectionClasses,
  quickNpcBuildCardSetupOffsetClasses,
} from './quick-npc-build-card.variants'
import type { CreateSetupSet } from '@/lib/create-setup'

export type QuickNpcCreateSetupPhaseProps = {
  buildContext: CharacterBuildContext
  createContext: QuickNpcCreateContext
  setupValues: QuickNpcSetupValues
  setupSets: CreateSetupSet[]
  sequenceModel: CreateSetupSequenceModel
  onSetupValueChange: (event: CreateSetupValueChangeEvent) => void
}

export function QuickNpcCreateSetupPhase({
  buildContext,
  createContext,
  setupValues,
  setupSets,
  sequenceModel,
  onSetupValueChange,
}: QuickNpcCreateSetupPhaseProps) {
  const organization = resolveQuickNpcCreateOrganization(createContext)

  const buildCardModel = React.useMemo(
    () =>
      resolveQuickNpcBuildCardModel({
        createContext,
        context: buildContext,
        values: setupValues,
        titles: organization?.members?.titles ?? [],
        members: {
          classAffinityIds: organization?.members?.classAffinityIds,
        },
      }),
    [
      buildContext,
      createContext,
      organization?.members?.classAffinityIds,
      organization?.members?.titles,
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
