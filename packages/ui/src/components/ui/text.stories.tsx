import type { Meta, StoryObj } from '@storybook/react-vite'

import { Text } from './text'
import { TextVariantCatalog } from './text-catalog'

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

export const Supporting: Story = {
  args: {
    variant: 'supporting',
    children: 'Secondary explanatory copy (14px muted).',
  },
}

export const Small: Story = {
  args: {
    variant: 'small',
    children: 'Legacy 15px muted treatment.',
  },
}

export const Caption: Story = {
  args: {
    variant: 'caption',
    children: 'Form field hint — persistent guidance below a control.',
  },
}

export const Label: Story = {
  args: {
    variant: 'label',
    children: 'Compact UI descriptor — not a native form label.',
  },
}

export const Emphasis: Story = {
  args: {
    variant: 'emphasis',
    children: 'Medium-weight emphasis treatment.',
  },
}

export const Option: Story = {
  args: {
    variant: 'option',
    children: 'Choice row primary line.',
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

export const Info: Story = {
  args: {
    variant: 'info',
    children: 'Multiclassing is disabled for this campaign.',
  },
}

export const Success: Story = {
  args: {
    variant: 'success',
    children: 'Changes saved successfully.',
  },
}

export const Warning: Story = {
  args: {
    variant: 'warning',
    children: 'Subclass choices are disabled for this campaign.',
  },
}

export const RoleCatalog: Story = {
  render: () => <TextVariantCatalog />,
}
