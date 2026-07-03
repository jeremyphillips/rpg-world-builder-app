import type { Meta, StoryObj } from '@storybook/react-vite'

import { Button } from './button.client'
import { Alert } from './alert'
import { ALERT_VARIANTS } from './alert.variants'

const meta = {
  title: 'Primitives/Alert',
  component: Alert,
  args: {
    title: 'Subclass choices are disabled',
    description:
      'This feature is saved, but characters will not be prompted to choose a subclass until subclasses are enabled.',
  },
} satisfies Meta<typeof Alert>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Info: Story = {
  args: {
    variant: 'info',
    title: 'Multiclassing is disabled',
    description: 'Species rules that depend on multiclassing are inactive for this campaign.',
  },
}

export const Success: Story = {
  args: {
    variant: 'success',
    title: 'Changes saved',
    description: 'Your class features were updated successfully.',
  },
}

export const Warning: Story = {
  args: {
    variant: 'warning',
    title: 'Subclass choices are disabled',
    description:
      'This feature is saved, but characters will not be prompted to choose a subclass until subclasses are enabled.',
    actions: <Button size="sm">Enable subclasses</Button>,
  },
}

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    title: 'Could not save class',
    description: 'Fix the highlighted fields and try again.',
  },
}

export const AllVariants: Story = {
  render: () => (
    <div className="space-y-4">
      {ALERT_VARIANTS.map((variant) => (
        <Alert
          key={variant}
          variant={variant}
          title={`${variant.charAt(0).toUpperCase()}${variant.slice(1)} alert`}
          description="Supporting copy uses the shared muted description tone."
        />
      ))}
    </div>
  ),
}
