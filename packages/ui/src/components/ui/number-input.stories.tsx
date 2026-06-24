import type { Meta, StoryObj } from '@storybook/react-vite'

import { NumberInput } from './number-input.client'

const meta = {
  title: 'Forms/NumberInput',
  component: NumberInput,
  args: {
    'aria-label': 'Count',
    defaultValue: 5,
    min: 1,
    max: 20,
  },
} satisfies Meta<typeof NumberInput>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Small: Story = { args: { size: 'sm', defaultValue: 2 } }

export const Large: Story = { args: { size: 'lg', defaultValue: 12 } }

export const Disabled: Story = { args: { disabled: true } }

export const Invalid: Story = { args: { 'aria-invalid': true, defaultValue: 0 } }

/** Stepper bounds without HTML min/max — for in-progress edits in schema-driven forms. */
export const StepperBoundsOnly: Story = {
  args: {
    defaultValue: 10,
    min: undefined,
    max: undefined,
    stepperMin: 1,
    stepperMax: 10,
  },
}
