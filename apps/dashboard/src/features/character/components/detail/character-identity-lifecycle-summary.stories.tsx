import type { Meta, StoryObj } from '@storybook/react-vite'
import { createDefaultCharacterLifecycle } from '@rpg/contracts'

import { CharacterIdentityLifecycleSummary } from './character-identity-lifecycle-summary.client'

const meta = {
  title: 'Dashboard/Character/CharacterIdentityLifecycleSummary',
  component: CharacterIdentityLifecycleSummary,
  args: {
    lifecycle: createDefaultCharacterLifecycle(),
  },
} satisfies Meta<typeof CharacterIdentityLifecycleSummary>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {},
}

export const RetiredDeceased: Story = {
  args: {
    lifecycle: {
      roster: { status: 'retired', note: 'Left after the siege.' },
      vital: { status: 'deceased', note: 'Fell defending the gate.' },
    },
  },
}
