import type { Meta, StoryObj } from '@storybook/react-vite'

import { SAMPLE_PC } from '../lib/character-fixtures'
import { CharacterDetailContent } from './character-detail-content.client'

const meta = {
  title: 'Character/CharacterDetailContent',
  component: CharacterDetailContent,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof CharacterDetailContent>

export default meta
type Story = StoryObj<typeof CharacterDetailContent>

export const Default: Story = {
  args: {
    character: SAMPLE_PC,
  },
}
