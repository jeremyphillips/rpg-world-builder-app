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
import { QuickNpcPreviewNpcButton } from './quick-npc-preview-npc-button'

const buildContext = createCampaignNpcBuilderContextFixture({ catalog: populatedBuilderCatalog })

const setup = quickNpcStandaloneSetupValues({
  npcTemplateId: 'guard',
  speciesId: populatedBuilderCatalog.species[0]!.id,
  classId: populatedBuilderCatalog.classes[0]!.id,
  level: 1,
})

const meta = {
  title: 'Features/Character/Quick NPC/Preview NPC button',
  component: QuickNpcPreviewNpcButton,
  decorators: [withDashboardProviders],
  args: {
    buildContext,
    createContext: quickNpcStandaloneCreateContext(),
    setup,
    getAuthoringValues: () => ({
      ...quickNpcAuthoringTabDefaultValues,
      name: 'Preview Guard',
      gender: 'male',
      alignment: 'ng',
    }),
  },
} satisfies Meta<typeof QuickNpcPreviewNpcButton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Disabled: Story = {
  args: {
    disabled: true,
  },
}
