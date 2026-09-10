import type { Meta, StoryObj } from '@storybook/react-vite'

import { LandingHero } from './landing-hero'

const meta = {
  title: 'Landing/LandingHero',
  component: LandingHero,
} satisfies Meta<typeof LandingHero>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
