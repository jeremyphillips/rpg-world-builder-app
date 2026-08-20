import type { Meta, StoryObj } from '@storybook/react-vite'

import { createEmptyCharacterBuilderDraft } from '@rpg/contracts'

import {
  createCampaignPcBuilderContextFixture,
  createStandaloneBuilderContextFixture,
} from '../lib/fixtures/character-builder-fixtures'
import { CharacterBuilderLevelControl } from './character-builder-level-control.client'

const meta = {
  title: 'Character Builder/CharacterBuilderLevelControl',
  component: CharacterBuilderLevelControl,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof CharacterBuilderLevelControl>

export default meta
type Story = StoryObj<typeof CharacterBuilderLevelControl>

export const SelectableStandalonePc: Story = {
  args: {
    context: createStandaloneBuilderContextFixture(),
    draft: createEmptyCharacterBuilderDraft(),
    onApplyLevelDraft: () => undefined,
  },
}

export const FixedCampaignPc: Story = {
  args: {
    context: createCampaignPcBuilderContextFixture(),
    draft: createEmptyCharacterBuilderDraft(),
    onApplyLevelDraft: () => undefined,
  },
}
