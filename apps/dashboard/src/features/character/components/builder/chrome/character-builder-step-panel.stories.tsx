import type { Meta, StoryObj } from '@storybook/react-vite'

import { CharacterBuilderStepPanel } from './character-builder-step-panel.client'

const meta = {
  title: 'Character Builder/CharacterBuilderStepPanel',
  component: CharacterBuilderStepPanel,
} satisfies Meta<typeof CharacterBuilderStepPanel>

export default meta
type Story = StoryObj<typeof CharacterBuilderStepPanel>

export const ProficienciesDeferred: Story = {
  args: {
    stepId: 'proficiencies',
    status: 'deferred',
  },
}

export const SpellsSkipped: Story = {
  args: {
    stepId: 'spells',
    status: 'deferred',
  },
}
