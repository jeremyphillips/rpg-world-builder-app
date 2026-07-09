import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'

import { ReviewRequiredItems } from './review-required-items.client'

const meta = {
  title: 'Character Builder/ReviewRequiredItems',
  component: ReviewRequiredItems,
  args: {
    onNavigateToStep: fn(),
  },
} satisfies Meta<typeof ReviewRequiredItems>

export default meta
type Story = StoryObj<typeof ReviewRequiredItems>

export const WithRequiredItems: Story = {
  args: {
    requiredItems: [
      {
        id: 'choiceSet:class:srd-cc-5.2.1:fighter:class-skills',
        kind: 'choiceSet',
        label: 'Choose Skills',
        message: 'Choose at least 2 options for Choose Skills.',
        stepId: 'proficiencies',
        stepLabel: 'Proficiencies',
        progress: { current: 0, total: 2, max: 2 },
      },
      {
        id: 'stepField:identity:name_required',
        kind: 'stepField',
        label: 'Identity',
        message: 'Enter a character name.',
        stepId: 'identity',
        stepLabel: 'Identity',
      },
    ],
  },
}

export const Empty: Story = {
  args: {
    requiredItems: [],
  },
}
