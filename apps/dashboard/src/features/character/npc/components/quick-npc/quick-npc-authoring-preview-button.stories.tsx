import type { Meta, StoryObj } from '@storybook/react-vite'

import { withDashboardProviders } from '../../../../../../.storybook/decorators'
import {
  createCampaignNpcBuilderContextFixture,
  populatedBuilderCatalog,
} from '../../../lib/fixtures/character-builder-fixtures'
import { quickNpcAuthoringTabDefaultValues } from '../../lib/quick-npc/quick-npc-form-fields'
import {
  quickNpcStandaloneCreateContext,
  quickNpcStandaloneSetupValues,
} from '../../lib/quick-npc/quick-npc-test-fixtures'
import { QuickNpcAuthoringPreviewButton } from './quick-npc-authoring-preview-button'
import { QuickNpcPreparedBuildProvider } from './quick-npc-prepared-build-context'

const meta = {
  title: 'Features/Character/Quick NPC/Authoring preview button',
  component: QuickNpcAuthoringPreviewButton,
  decorators: [
    (Story) => (
      <QuickNpcPreparedBuildProvider>
        <Story />
      </QuickNpcPreparedBuildProvider>
    ),
    withDashboardProviders,
  ],
  args: {
    buildContext: createCampaignNpcBuilderContextFixture({ catalog: populatedBuilderCatalog }),
    createContext: quickNpcStandaloneCreateContext(),
    setup: quickNpcStandaloneSetupValues({
      npcTemplateId: 'guard',
      speciesId: populatedBuilderCatalog.species[0]!.id,
      classId: populatedBuilderCatalog.classes[0]!.id,
      level: 1,
    }),
    getAuthoringValues: () => ({ ...quickNpcAuthoringTabDefaultValues, name: 'Preview Guard' }),
  },
} satisfies Meta<typeof QuickNpcAuthoringPreviewButton>

export default meta

/** Without a published live build, preview falls back to click-time preparation. */
export const Default: StoryObj<typeof meta> = {}
