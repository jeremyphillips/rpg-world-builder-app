import type { Meta, StoryObj } from '@storybook/react-vite'

import { Text } from './text'

const meta = {
  title: 'Typography/Text',
  component: Text,
  args: {
    children: 'Body copy for the interface.',
  },
} satisfies Meta<typeof Text>

export default meta
type Story = StoryObj<typeof meta>

export const Body: Story = {
  args: { variant: 'body' },
}

export const Muted: Story = {
  args: {
    variant: 'muted',
    children: 'Plain description text under a content title.',
  },
}

export const Small: Story = {
  args: {
    variant: 'small',
    children: 'Secondary hint or card description tone.',
  },
}

export const Lead: Story = {
  args: {
    variant: 'lead',
    children: 'Marketing lead paragraph on the public landing page.',
  },
}

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    role: 'alert',
    children: 'Could not load content.',
  },
}

export const AllVariants: Story = {
  render: () => (
    <div className="space-y-3">
      <Text variant="body">Body — default foreground copy.</Text>
      <Text variant="muted">Muted — supplementary descriptions.</Text>
      <Text variant="small">Small — hints and secondary metadata.</Text>
      <Text variant="lead">Lead — hero or intro paragraphs.</Text>
      <Text variant="destructive" role="alert">
        Destructive — inline error messages.
      </Text>
    </div>
  ),
}
