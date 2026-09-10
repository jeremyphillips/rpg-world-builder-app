import type { Meta, StoryObj } from '@storybook/react-vite'

import { LandingFeatures } from './landing-features'

const meta = {
  title: 'Landing/LandingFeatures',
  component: LandingFeatures,
} satisfies Meta<typeof LandingFeatures>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
