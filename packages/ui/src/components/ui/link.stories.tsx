import type { Meta, StoryObj } from '@storybook/react-vite'

import { Link } from './link'

const meta = {
  title: 'Primitives/Link',
  component: Link,
  args: {
    href: '#',
    children: 'Rules',
  },
  argTypes: {
    context: {
      control: 'select',
      options: ['inline', 'standalone'],
    },
    tone: {
      control: 'select',
      options: ['accent', 'neutral', 'danger'],
    },
  },
} satisfies Meta<typeof Link>

export default meta
type Story = StoryObj<typeof meta>

export const InlineDefault: Story = {
  render: (args) => (
    <p className="text-sm text-foreground">
      See the campaign <Link {...args} /> for details.
    </p>
  ),
}

export const StandaloneNeutral: Story = {
  args: {
    context: 'standalone',
    tone: 'neutral',
    children: 'View something',
  },
}

export const StandaloneAccent: Story = {
  args: {
    context: 'standalone',
    tone: 'accent',
    children: 'Choose class →',
  },
}

export const StandaloneDanger: Story = {
  args: {
    context: 'standalone',
    tone: 'danger',
    children: 'Delete draft',
  },
}
