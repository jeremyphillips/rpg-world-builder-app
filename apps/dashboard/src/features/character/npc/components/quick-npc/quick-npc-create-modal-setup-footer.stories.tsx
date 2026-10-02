import type { Meta, StoryObj } from '@storybook/react-vite'
import { useRef } from 'react'

import { withDashboardProviders } from '../../../../../../.storybook/decorators'
import {
  createCampaignNpcBuilderContextFixture,
  populatedBuilderCatalog,
} from '../../../lib/fixtures/character-builder-fixtures'
import { buildQuickNpcCreateSetupSets } from '../../lib/quick-npc/quick-npc-create-modal-setup.lib'
import {
  quickNpcStandaloneCreateContext,
  quickNpcStandaloneSetupValues,
} from '../../lib/quick-npc/quick-npc-test-fixtures'
import { QuickNpcCreateModalSetupFooter } from './quick-npc-create-modal-setup-footer'

const buildContext = createCampaignNpcBuilderContextFixture({ catalog: populatedBuilderCatalog })

function SetupFooterStory() {
  const previewNpcButtonRef = useRef<HTMLButtonElement>(null)
  const createContext = quickNpcStandaloneCreateContext()
  const setup = quickNpcStandaloneSetupValues({
    npcTemplateId: 'guard',
    speciesId: populatedBuilderCatalog.species[0]!.id,
    classId: populatedBuilderCatalog.classes[0]!.id,
    level: 1,
  })
  const setupSets = buildQuickNpcCreateSetupSets({
    createContext,
    context: buildContext,
    values: setup,
    titles: [],
  })

  return (
    <QuickNpcCreateModalSetupFooter
      buildContext={buildContext}
      createContext={createContext}
      setup={setup}
      previewNpcButtonRef={previewNpcButtonRef}
      sequenceModel={{
        activeSetId: null,
        visibleSetIds: setupSets.map((set) => set.id),
        reopenSetId: null,
        reopen: () => undefined,
        takeEditSessionDismiss: () => undefined,
        isEditingUpstream: false,
        isComplete: true,
        pendingExplicitDecisions: [],
        completeExplicitDecision: () => undefined,
      }}
      footerContext={{
        setupSets,
        externalDecisions: [],
        activeSetId: null,
        isEditingUpstream: false,
      }}
      onCancel={() => undefined}
      onSetupComplete={() => undefined}
    />
  )
}

const meta = {
  title: 'Features/Character/Quick NPC/Setup footer',
  component: SetupFooterStory,
  decorators: [withDashboardProviders],
} satisfies Meta<typeof SetupFooterStory>

export default meta
type Story = StoryObj<typeof meta>

export const ReadyToContinue: Story = {}
