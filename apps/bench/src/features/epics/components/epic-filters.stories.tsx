import type { Meta, StoryObj } from '@storybook/react-vite'

import type { EpicListFilters } from '../hooks/epic-query-keys'
import { EpicFilters } from './epic-filters'

const meta = {
  title: 'Bench/Epics/EpicFilters',
  component: EpicFilters,
} satisfies Meta<typeof EpicFilters>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    filters: {},
    onChange: () => undefined,
  },
}

export const WithFilters: Story = {
  args: {
    filters: { status: 'active', area: 'rules' } satisfies EpicListFilters,
    onChange: () => undefined,
  },
}
