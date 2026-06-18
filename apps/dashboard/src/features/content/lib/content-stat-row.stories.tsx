import type { Meta, StoryObj } from '@storybook/react-vite'

import { ContentStatRow } from './content-stat-row'

const meta = {
  title: 'Content/ContentStatRow',
  component: ContentStatRow,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ContentStatRow>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    label: 'Hit Die',
    value: 'd12 per level',
  },
}

export const LongValue: Story = {
  args: {
    label: 'Skills',
    value: 'Choose 2 from: Animal Handling, Athletics, Intimidation, Nature, Perception, Survival',
  },
}

export const MultipleRows: Story = {
  render: () => (
    <div className="space-y-1">
      <ContentStatRow label="Hit Die" value="d12 per level" />
      <ContentStatRow label="Primary Abilities" value="Strength" />
      <ContentStatRow label="Saving Throws" value="Strength, Constitution" />
      <ContentStatRow label="Armor" value="Light, Medium, Shields" />
      <ContentStatRow label="Weapons" value="Simple, Martial" />
      <ContentStatRow
        label="Skills"
        value="Choose 2 from: Animal Handling, Athletics, Intimidation, Nature, Perception, Survival"
      />
    </div>
  ),
}
