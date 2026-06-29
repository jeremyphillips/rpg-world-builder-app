import type { Meta, StoryObj } from '@storybook/react-vite'
import type { ComponentProps } from 'react'
import { MemoryRouter } from 'react-router-dom'

import { sampleEpic } from '@/features/epics'

import { EpicBadge } from './epic-badge'

const meta = {
  title: 'Bench/EpicBadge',
  component: EpicBadge,
} satisfies Meta<typeof EpicBadge>

export default meta
type Story = StoryObj<typeof meta>

function EpicBadgeStory(props: ComponentProps<typeof EpicBadge>) {
  return (
    <MemoryRouter>
      <EpicBadge {...props} />
    </MemoryRouter>
  )
}

export const WithColor: Story = {
  args: {
    epic: {
      id: sampleEpic.id,
      title: sampleEpic.title,
      badgeColor: sampleEpic.badgeColor,
    },
  },
  render: (args) => <EpicBadgeStory {...args} />,
}

export const NoEpic: Story = {
  args: {
    epic: null,
  },
  render: (args) => <EpicBadgeStory {...args} />,
}
