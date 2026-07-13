import type { Meta, StoryObj } from '@storybook/react-vite'
import * as React from 'react'

import { NumberStepper } from './number-stepper.client'

function NumberStepperHarness(
  props: Omit<React.ComponentProps<typeof NumberStepper>, 'value' | 'onChange'>,
) {
  const [value, setValue] = React.useState(props.min ?? 3)
  return <NumberStepper {...props} value={value} onChange={setValue} />
}

const meta = {
  title: 'Forms/NumberStepper',
  component: NumberStepperHarness,
  args: {
    'aria-label': 'Quantity',
    min: 1,
    max: 20,
  },
} satisfies Meta<typeof NumberStepperHarness>

export default meta
type Story = StoryObj<typeof meta>

/** Comfortable default with bordered pill container. */
export const Default: Story = {}

/** Compact bordered stepper (sm). */
export const CompactBordered: Story = {
  args: { size: 'sm' },
}

/** Compact borderless stepper for dense inventory rows. */
export const CompactBorderless: Story = {
  args: { size: 'sm', bordered: false },
}

export const SingleDigit: Story = {
  args: { digits: 1, min: 1, max: 9 },
}

export const Disabled: Story = {
  args: { disabled: true },
}

export const AtMax: Story = {
  render: (args) => <NumberStepperHarness {...args} min={1} max={5} />,
  args: { max: 5 },
}
