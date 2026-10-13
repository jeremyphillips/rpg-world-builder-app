import type { Meta, StoryObj } from '@storybook/react-vite'

import { SelectionSummaryCards } from './selection-summary-decisions'

const meta = {
  title: 'Forms/SelectionSummaryDecisions',
  component: SelectionSummaryCards,
  args: {
    cards: [
      {
        id: 'selections',
        eyebrow: 'Selections',
        rows: [
          {
            id: 'role',
            label: 'Role',
            value: 'Commoner',
            decisionId: 'role',
            onNavigate: () => undefined,
          },
          {
            id: 'build',
            label: 'Build',
            value: 'Commoner · Level 0',
            description: 'Optional helper copy',
            decisionId: 'build',
            onNavigate: () => undefined,
          },
        ],
      },
    ],
  },
} satisfies Meta<typeof SelectionSummaryCards>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const ActiveBuildDecision: Story = {
  args: {
    activeDecisionId: 'build',
  },
}
