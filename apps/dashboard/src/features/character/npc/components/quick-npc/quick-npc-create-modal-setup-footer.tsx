import type { RefObject } from 'react'

import type { CharacterBuildContext } from '@rpg/contracts'

import { CreateSetupFooter, type CreateSetupSequenceModel } from '@/lib/create-setup'

import {
  quickNpcAuthoringTabDefaultValues,
  type QuickNpcAuthoringTabFormValues,
  type QuickNpcSetupValues,
} from '../../lib/quick-npc/quick-npc-form-fields'
import type { QuickNpcCreateContext } from '../../lib/quick-npc/quick-npc-create-context'
import {
  quickNpcCreateSetupShowsPreviewNpc,
  resolveQuickNpcCreateSetupFooterActions,
  type QuickNpcCreateSetupFooterContext,
} from '../../lib/quick-npc/quick-npc-create-modal-setup.lib'
import { QuickNpcPreviewNpcButton } from './quick-npc-preview-npc-button'
import { quickNpcCreateFooterLayoutClasses } from './quick-npc-create-footer.variants'

export type QuickNpcCreateModalSetupFooterProps = {
  buildContext: CharacterBuildContext
  createContext: QuickNpcCreateContext
  setup: QuickNpcSetupValues
  authoringValues?: Partial<QuickNpcAuthoringTabFormValues>
  previewNpcButtonRef: RefObject<HTMLButtonElement | null>
  sequenceModel: CreateSetupSequenceModel
  footerContext: QuickNpcCreateSetupFooterContext
  onCancel: () => void
  onSetupComplete: () => void
}

export function QuickNpcCreateModalSetupFooter({
  buildContext,
  createContext,
  setup,
  authoringValues,
  previewNpcButtonRef,
  sequenceModel,
  footerContext,
  onCancel,
  onSetupComplete,
}: QuickNpcCreateModalSetupFooterProps) {
  const setupFooterActions = resolveQuickNpcCreateSetupFooterActions(footerContext)
  const showSetupPreviewNpc = quickNpcCreateSetupShowsPreviewNpc(setupFooterActions)

  return (
    <div className={quickNpcCreateFooterLayoutClasses()}>
      {showSetupPreviewNpc ? (
        <QuickNpcPreviewNpcButton
          buttonRef={previewNpcButtonRef}
          buildContext={buildContext}
          createContext={createContext}
          setup={setup}
          getAuthoringValues={() => ({ ...quickNpcAuthoringTabDefaultValues, ...authoringValues })}
        />
      ) : null}
      <CreateSetupFooter
        model={sequenceModel}
        onCancel={onCancel}
        onSetupComplete={onSetupComplete}
      />
    </div>
  )
}
