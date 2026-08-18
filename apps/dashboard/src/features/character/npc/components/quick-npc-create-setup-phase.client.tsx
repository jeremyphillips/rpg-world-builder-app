'use client'

import * as React from 'react'

import type { CharacterBuildContext } from '@rpg/contracts'

import { CreateSetupPanel, createSetupModalBodyClasses } from '@/lib/create-setup'
import { cn } from '@rpg/ui'

import type { QuickNpcSetupValues } from '../lib/quick-npc-form-fields'
import { resolveQuickNpcBuildCardModel } from '../lib/quick-npc-build-card.lib'
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
  onApplySetupChange: (setId: string, nextValue: string | number) => void
}

export function QuickNpcCreateSetupPhase({
  buildContext,
  organization,
  setupValues,
  onApplySetupChange,
}: QuickNpcCreateSetupPhaseProps) {
  const setupSets = React.useMemo(
    () =>
      buildQuickNpcCreateSetupSets({
        context: buildContext,
        values: setupValues,
        onApplySetupChange,
        titles: organization.members?.titles ?? [],
        members: {
          classAffinityIds: organization.members?.classAffinityIds,
          speciesAffinityIds: organization.members?.speciesAffinityIds,
        },
      }),
    [
      buildContext,
      onApplySetupChange,
      organization.members?.classAffinityIds,
      organization.members?.speciesAffinityIds,
      organization.members?.titles,
      setupValues,
    ],
  )

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

  return (
    <div className={createSetupModalBodyClasses}>
      <CreateSetupPanel
        className="contents"
        sets={setupSets}
        changeLabel={QUICK_NPC_SETUP_CHANGE_LABEL}
      />
      {buildCardModel ? (
        <QuickNpcBuildCard
          className={cn(quickNpcBuildCardSectionClasses, quickNpcBuildCardSetupOffsetClasses)}
          model={buildCardModel}
          onClassChange={(classId) => onApplySetupChange('classId', classId)}
          onLevelChange={(level) => onApplySetupChange('level', level)}
        />
      ) : null}
    </div>
  )
}
