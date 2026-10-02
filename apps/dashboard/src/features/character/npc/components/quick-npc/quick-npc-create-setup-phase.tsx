import * as React from 'react'

import type { CharacterBuildContext } from '@rpg/contracts'

import {
  CreateSetupPanel,
  createSetupModalBodyClasses,
  resolveSetupSummaryCards,
  type CreateSetupSequenceModel,
  type CreateSetupValueChangeEvent,
} from '@/lib/create-setup'
import { cn } from '@rpg/ui'

import type { QuickNpcCreateContext } from '../../lib/quick-npc/quick-npc-create-context'
import { resolveQuickNpcCreateOrganization } from '../../lib/quick-npc/quick-npc-create-context'
import type { QuickNpcSetupValues } from '../../lib/quick-npc/quick-npc-form-fields'
import {
  isQuickNpcBuildCardVisible,
  resolveQuickNpcBuildCardModel,
} from '../../lib/quick-npc/quick-npc-build-card.lib'
import {
  QUICK_NPC_BUILD_EXTERNAL_DECISION_ID,
  QUICK_NPC_SETUP_CHANGE_LABEL,
  QUICK_NPC_SETUP_SUMMARY,
} from '../../lib/quick-npc/quick-npc-create-modal-setup.lib'
import { QuickNpcBuildCard } from './quick-npc-build-card'
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
          npcTemplateId: organization?.members?.npcTemplateId,
        },
        organizationName: organization?.name,
      }),
    [
      buildContext,
      createContext,
      organization?.members?.classAffinityIds,
      organization?.members?.npcTemplateId,
      organization?.members?.titles,
      organization?.name,
      setupValues,
    ],
  )

  const showBuildCard = isQuickNpcBuildCardVisible({
    buildCardModel,
    isEditingUpstream: sequenceModel.isEditingUpstream,
  })
  const summaryCards = React.useMemo(
    () =>
      resolveSetupSummaryCards(
        {
          createContext,
          values: setupValues,
          context: buildContext,
          titles: organization?.members?.titles ?? [],
        },
        QUICK_NPC_SETUP_SUMMARY,
      ),
    [buildContext, createContext, organization?.members?.titles, setupValues],
  )
  const activeSummaryTargetId =
    sequenceModel.activeSetId ?? (showBuildCard ? QUICK_NPC_BUILD_EXTERNAL_DECISION_ID : null)

  return (
    <div className={createSetupModalBodyClasses}>
      <CreateSetupPanel
        className="contents"
        sets={setupSets}
        model={sequenceModel}
        changeLabel={QUICK_NPC_SETUP_CHANGE_LABEL}
        onSetupValueChange={onSetupValueChange}
        summaryCards={summaryCards}
        activeSummaryTargetId={activeSummaryTargetId}
        onSummaryNavigate={(targetSetId) => {
          if (targetSetId === QUICK_NPC_BUILD_EXTERNAL_DECISION_ID) {
            sequenceModel.reopen(null)
            return
          }
          sequenceModel.reopen(targetSetId)
        }}
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
          onRoleChange={
            createContext.kind === 'organization-member'
              ? (npcTemplateId) =>
                  onSetupValueChange({
                    setId: 'npcTemplateId',
                    previousValue: setupValues.npcTemplateId ?? '',
                    nextValue: npcTemplateId,
                    invalidatedSetIds: [],
                  })
              : undefined
          }
        />
      ) : null}
    </div>
  )
}
