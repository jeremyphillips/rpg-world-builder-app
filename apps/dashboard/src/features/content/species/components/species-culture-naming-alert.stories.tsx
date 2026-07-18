import type { Meta, StoryObj } from '@storybook/react-vite'

import { SpeciesCultureNamingAlert } from './species-culture-naming-alert.client'

const meta = {
  title: 'Dashboard/Species/SpeciesCultureNamingAlert',
  component: SpeciesCultureNamingAlert,
} satisfies Meta<typeof SpeciesCultureNamingAlert>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
