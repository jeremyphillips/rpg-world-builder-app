import type { Meta, StoryObj } from '@storybook/react-vite'

import { LandingHowItWorks } from './landing-how-it-works'

const meta = {
  title: 'Landing/LandingHowItWorks',
  component: LandingHowItWorks,
} satisfies Meta<typeof LandingHowItWorks>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
