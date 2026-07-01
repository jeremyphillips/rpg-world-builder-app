import type { Meta, StoryObj } from '@storybook/react-vite'

import { LevelRangeField } from './level-range-field.client'

const OPTIONS = Array.from({ length: 20 }, (_, index) => {
  const level = index + 1
  return { value: String(level), label: String(level) }
})

const meta = {
  title: 'UI/LevelRangeField',
  component: LevelRangeField,
  args: {
    id: 'level-range',
    label: 'Level range',
    minId: 'level-range-min',
    maxId: 'level-range-max',
    minValue: 1,
    maxValue: 4,
    minOptions: OPTIONS,
    maxOptions: OPTIONS,
    required: true,
  },
} satisfies Meta<typeof LevelRangeField>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const ExtendedRange: Story = {
  args: {
    minValue: 17,
    maxValue: 20,
  },
}
