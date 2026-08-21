import type { Meta, StoryObj } from '@storybook/react-vite'

import { CharacterImportUnmappedAlert } from './character-import-unmapped-alert'

const meta = {
  title: 'Dashboard/Character Import/Unmapped Alert',
  component: CharacterImportUnmappedAlert,
} satisfies Meta<typeof CharacterImportUnmappedAlert>

export default meta

type Story = StoryObj<typeof meta>

export const ReadinessAndServerOwned: Story = {
  args: {
    coverage: [
      {
        targetPath: 'classes',
        state: 'unresolved-reference',
        reason: 'Class levels are present in the source but require local catalog matching.',
      },
      {
        targetPath: 'id',
        state: 'server-owned',
        reason: 'The API assigns the character id on save.',
      },
    ],
  },
}
