import type { Meta, StoryObj } from '@storybook/react-vite'

import {
  EntityRowInlineBadge,
  EntityRowInlineDensityProvider,
} from './entity-row-inline-badge.client'
import type { GenericCardDensity } from './card.variants'

const meta = {
  title: 'UI/EntityRowInlineBadge',
  component: EntityRowInlineBadge,
  tags: ['autodocs'],
} satisfies Meta<typeof EntityRowInlineBadge>

export default meta

type Story = StoryObj<typeof meta>

function DensityRow({ density }: { density: GenericCardDensity }) {
  return (
    <EntityRowInlineDensityProvider density={density}>
      <div className="flex items-center gap-2">
        <span className="text-style-caption w-28">{density}</span>
        <EntityRowInlineBadge tone="warning">Unavailable</EntityRowInlineBadge>
      </div>
    </EntityRowInlineDensityProvider>
  )
}

export const DensityLadder: Story = {
  args: { children: 'Unavailable', tone: 'warning' },
  render: () => (
    <div className="flex flex-col gap-3">
      <DensityRow density="compact" />
      <DensityRow density="comfortable" />
      <DensityRow density="spacious" />
    </div>
  ),
}
