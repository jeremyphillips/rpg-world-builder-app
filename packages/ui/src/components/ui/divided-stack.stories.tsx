import type { Meta, StoryObj } from '@storybook/react-vite'

import { DividedStack } from './divided-stack'

const rowClassName = 'rounded-md bg-muted px-3 py-2 text-style-supporting'

const meta = {
  title: 'Primitives/DividedStack',
  component: DividedStack,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Each logical row must be one direct DOM child. React fragments or multiple roots per row create extra dividers.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DividedStack>

export default meta
type Story = StoryObj<typeof meta>

export const Empty: Story = {
  args: {
    density: 'comfortable',
    children: null,
  },
}

export const SingleRow: Story = {
  name: 'Single row',
  args: {
    density: 'comfortable',
    children: <div className={rowClassName}>Only section — no divider</div>,
  },
}

export const MultipleRowsComfortable: Story = {
  name: 'Multiple rows (comfortable)',
  args: {
    density: 'comfortable',
    children: (
      <>
        <div className={rowClassName}>Currency budget row</div>
        <div className={rowClassName}>Magic items row</div>
      </>
    ),
  },
}

export const MultipleRowsCompact: Story = {
  name: 'Multiple rows (compact)',
  args: {
    density: 'compact',
    children: (
      <>
        <div className={rowClassName}>Currency budget row</div>
        <div className={rowClassName}>Magic items row</div>
      </>
    ),
  },
}
