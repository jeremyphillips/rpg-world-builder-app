import type { Meta, StoryObj } from '@storybook/react-vite'

import { DecisionSummaryPanel, SelectionSummaryCards } from './selection-summary-decisions'

const meta = {
  title: 'Forms/SelectionSummaryDecisions',
  component: DecisionSummaryPanel,
  args: {
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
} satisfies Meta<typeof DecisionSummaryPanel>

export default meta
type Story = StoryObj<typeof meta>

export const DefaultCard: Story = {}

export const DrawerSubStep: Story = {
  args: {
    rows: [
      {
        id: 'effect-target',
        label: 'Effect target',
        value: 'Attack rolls',
        decisionId: 'effect-target',
        onNavigate: () => undefined,
      },
    ],
  },
}

export const MultiCard: Story = {
  render: () => (
    <SelectionSummaryCards
      cards={[
        {
          id: 'selections',
          rows: [
            {
              id: 'role',
              label: 'Role',
              value: 'Commoner',
              decisionId: 'role',
              onNavigate: () => undefined,
            },
          ],
        },
      ]}
    />
  ),
}

export const ActiveBuildDecision: Story = {
  render: () => (
    <SelectionSummaryCards
      activeDecisionId="build"
      cards={[
        {
          id: 'selections',
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
              decisionId: 'build',
              onNavigate: () => undefined,
            },
          ],
        },
      ]}
    />
  ),
}
