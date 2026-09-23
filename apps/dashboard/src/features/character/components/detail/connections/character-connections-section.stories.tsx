import type { Meta, StoryObj } from '@storybook/react-vite'

import { CharacterConnectionsSection } from './character-connections-section'

const meta = {
  title: 'Character/Detail/Connections/CharacterConnectionsSection',
  component: CharacterConnectionsSection,
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof CharacterConnectionsSection>

export default meta

type Story = StoryObj<typeof meta>

export const ReadOnly: Story = {
  args: {
    campaignId: 'campaign-1',
    characterId: 'character-1',
    canEdit: false,
    subjectKind: 'pc',
  },
}

export const Editable: Story = {
  args: {
    campaignId: 'campaign-1',
    characterId: 'character-1',
    canEdit: true,
    subjectKind: 'pc',
  },
}
