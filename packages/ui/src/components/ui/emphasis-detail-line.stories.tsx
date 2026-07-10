import type { Meta, StoryObj } from '@storybook/react-vite'

import { Text } from './text'
import { EmphasisDetailLine } from './emphasis-detail-line'

const meta = {
  title: 'Primitives/EmphasisDetailLine',
  component: EmphasisDetailLine,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof EmphasisDetailLine>

export default meta
type Story = StoryObj<typeof meta>

export const BudgetHeader: Story = {
  args: {
    as: 'p',
    className: 'text-sm text-foreground',
    prefix: <span className="font-medium">Budget:</span>,
    primary: '5 GP remaining',
    secondary: '100 GP starting · 95 GP spent',
  },
}

export const WarningNote: Story = {
  args: {
    primary: '75 GP needed',
    secondary: '40 GP remaining',
    secondaryTone: 'subtle',
  },
  render: (args) => (
    <Text as="p" variant="warning" className="flex items-start gap-1.5 text-xs">
      <EmphasisDetailLine {...args} />
    </Text>
  ),
}
