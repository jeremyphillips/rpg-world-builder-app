import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'

import { LocationSiteCreateSetup } from './location-site-create-setup.client'

const meta = {
  title: 'Content/Locations/LocationSiteCreateSetup',
  component: LocationSiteCreateSetup,
  args: {
    open: true,
    onOpenChange: fn(),
    onComplete: fn(),
    intent: { authoringType: 'site' },
  },
} satisfies Meta<typeof LocationSiteCreateSetup>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
