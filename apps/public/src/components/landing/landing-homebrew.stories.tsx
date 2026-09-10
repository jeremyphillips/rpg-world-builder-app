import type { Meta, StoryObj } from '@storybook/react-vite'

import { LandingHomebrew } from './landing-homebrew'

const meta = {
  title: 'Landing/LandingHomebrew',
  component: LandingHomebrew,
} satisfies Meta<typeof LandingHomebrew>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
