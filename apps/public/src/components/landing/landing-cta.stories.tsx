import type { Meta, StoryObj } from '@storybook/react-vite'

import { LandingCta } from './landing-cta'

const meta = {
  title: 'Landing/LandingCta',
  component: LandingCta,
} satisfies Meta<typeof LandingCta>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
