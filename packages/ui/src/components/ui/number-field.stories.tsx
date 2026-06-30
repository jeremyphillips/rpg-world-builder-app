import type { Meta, StoryObj } from '@storybook/react-vite'

import { NumberField } from './number-field'

const meta = {
  title: 'Forms/NumberField',
  component: NumberField,
  args: {
    id: 'count',
    label: 'Count',
    min: 1,
    max: 20,
    defaultValue: 1,
  },
} satisfies Meta<typeof NumberField>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithHint: Story = { args: { hint: 'Between 1 and 20.' } }

export const WithError: Story = { args: { error: 'Must be at least 1.', defaultValue: 0 } }

export const Disabled: Story = { args: { disabled: true } }

/** Container fills available space while the input is capped at a narrow intrinsic width. */
export const WithInputWidth: Story = {
  args: { hint: 'Container is full-width; input is capped at sm.', inputWidth: 'sm' },
}

/** Dense settings row — label + hint left, compact control right (campaign rules, advanced panels). */
export const SettingsRow: Story = {
  args: {
    id: 'min-score',
    label: 'Minimum ability score',
    hint: 'Applied to every primary ability on the target class and all current classes.',
    labelPosition: 'settings',
    digits: 2,
    min: 1,
    max: 30,
    defaultValue: 13,
    required: true,
  },
}
