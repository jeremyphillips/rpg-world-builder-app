import type { Meta, StoryObj } from '@storybook/react-vite'

import { AdvisoryAlert } from './advisory-alert'

const meta = {
  title: 'Primitives/AdvisoryAlert',
  component: AdvisoryAlert,
  args: {
    tone: 'warning',
    message: "Tunneler uses half the creature's Burrow Speed, but no Burrow Speed is configured.",
  },
} satisfies Meta<typeof AdvisoryAlert>

export default meta

type Story = StoryObj<typeof meta>

export const Warning: Story = {}

export const Info: Story = {
  args: {
    tone: 'info',
    message: 'Not proficient · PB not included',
  },
}

export const Error: Story = {
  args: {
    tone: 'error',
    message: 'This attack cannot be resolved.',
  },
}

export const WithTitle: Story = {
  args: {
    tone: 'warning',
    title: 'Missing speed',
    message: 'Flyby only applies while flying, but this creature has no Fly Speed.',
  },
}
