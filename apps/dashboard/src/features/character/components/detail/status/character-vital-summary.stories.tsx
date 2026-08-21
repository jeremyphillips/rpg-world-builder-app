import type { Meta, StoryObj } from '@storybook/react-vite'
import { createDefaultCharacterVitalState } from '@rpg/contracts'

import { CharacterVitalSummary } from './character-vital-summary'

const meta = {
  title: 'Dashboard/Character/CharacterVitalSummary',
  component: CharacterVitalSummary,
  args: {
    vital: createDefaultCharacterVitalState(),
  },
} satisfies Meta<typeof CharacterVitalSummary>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {},
}

export const Deceased: Story = {
  args: {
    vital: { status: 'deceased', note: 'Fell defending the gate.' },
  },
}
