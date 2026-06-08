import type { Meta, StoryObj } from '@storybook/react-vite'

import { Switch } from './switch.client'

const meta = {
  title: 'Forms/Controls/Switch',
  component: Switch,
  args: { 'aria-label': 'Enable notifications' },
} satisfies Meta<typeof Switch>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const On: Story = { args: { defaultChecked: true } }

export const Disabled: Story = { args: { disabled: true, defaultChecked: true } }
