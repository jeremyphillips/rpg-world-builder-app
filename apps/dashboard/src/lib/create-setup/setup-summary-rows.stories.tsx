import type { Meta, StoryObj } from '@storybook/react-vite'

import { SetupSummaryRows } from './setup-summary-rows'

const rows = [
  { id: 'role', label: 'Role', value: 'Scout', targetSetId: 'role' },
  { id: 'species', label: 'Species', value: 'Gnome', targetSetId: 'species' },
  { id: 'build', label: 'Build', value: 'Level 1 Ranger', targetSetId: 'build' },
]

const meta = {
  title: 'Create Setup/SetupSummaryRows',
  component: SetupSummaryRows,
  args: {
    eyebrow: 'Selections',
    rows,
    onNavigate: () => undefined,
  },
} satisfies Meta<typeof SetupSummaryRows>

export default meta
type Story = StoryObj<typeof meta>

export const InactiveRows: Story = {}

export const ActiveSpecies: Story = {
  args: {
    activeTargetId: 'species',
  },
}
