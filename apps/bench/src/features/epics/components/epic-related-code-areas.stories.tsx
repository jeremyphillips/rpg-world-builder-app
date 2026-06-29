import type { Meta, StoryObj } from '@storybook/react-vite'

import { EpicRelatedCodeAreas } from './epic-related-code-areas'

const meta = {
  title: 'Bench/Epics/EpicRelatedCodeAreas',
  component: EpicRelatedCodeAreas,
} satisfies Meta<typeof EpicRelatedCodeAreas>

export default meta
type Story = StoryObj<typeof meta>

export const WithAreas: Story = {
  args: { areas: ['@rpg/contracts', 'apps/bench', 'packages/dev-bench-core'] },
}

export const Empty: Story = {
  args: { areas: [] },
}
