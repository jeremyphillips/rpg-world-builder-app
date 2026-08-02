import type { Meta, StoryObj } from '@storybook/react-vite'

import { CharacterRelationshipIndicator } from './character-relationship-indicator.client'

const meta = {
  title: 'Shared/CharacterRelationshipIndicator',
  component: CharacterRelationshipIndicator,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof CharacterRelationshipIndicator>

export default meta

type Story = StoryObj<typeof meta>

export const ClassRelationship: Story = {
  args: {
    viewerCharacterRelationships: {
      count: 1,
      groups: [
        {
          kind: 'class',
          count: 1,
          relationships: [{ kind: 'class', characterId: '1', characterName: 'Aric' }],
        },
      ],
    },
  },
}

export const MixedSpellRelationships: Story = {
  args: {
    viewerCharacterRelationships: {
      count: 2,
      groups: [
        {
          kind: 'prepared',
          count: 1,
          relationships: [{ kind: 'prepared', characterId: '1', characterName: 'Aric' }],
        },
        {
          kind: 'knows',
          count: 1,
          relationships: [{ kind: 'knows', characterId: '2', characterName: 'Mira' }],
        },
      ],
    },
  },
}
