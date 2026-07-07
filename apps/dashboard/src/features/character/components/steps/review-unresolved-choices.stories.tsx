import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'

import { ReviewUnresolvedChoices } from './review-unresolved-choices.client'

const meta = {
  title: 'Character Builder/ReviewUnresolvedChoices',
  component: ReviewUnresolvedChoices,
  args: {
    onNavigateToStep: fn(),
  },
} satisfies Meta<typeof ReviewUnresolvedChoices>

export default meta
type Story = StoryObj<typeof ReviewUnresolvedChoices>

export const WithUnresolvedChoices: Story = {
  args: {
    unresolvedChoices: [
      {
        choiceSetId: 'class:srd-cc-5.2.1:fighter:class-skills',
        label: 'Choose Skills',
        stepId: 'proficiencies',
        stepLabel: 'Proficiencies',
        min: 2,
        max: 2,
        selectedCount: 0,
        message: 'Choose at least 2 options for Choose Skills.',
      },
      {
        choiceSetId: 'class:srd-cc-5.2.1:fighter:starting-equipment',
        label: 'Starting Equipment',
        stepId: 'equipment',
        stepLabel: 'Equipment',
        min: 1,
        max: 1,
        selectedCount: 0,
        message: 'Choose an option for Starting Equipment.',
      },
    ],
  },
}

export const Empty: Story = {
  args: {
    unresolvedChoices: [],
  },
}
