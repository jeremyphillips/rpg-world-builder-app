import type { Meta, StoryObj } from '@storybook/react-vite'
import * as React from 'react'

import { FormSectionProvider } from '../../form/context/form-section.context'
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

/** Comfortable default with bordered pill container (md / 36px). */
export const Default: Story = {}

export const ExtraSmall: Story = {
  args: { size: 'xs', min: 0, max: 8 },
}

/** Compact form field scale (sm / 32px). */
export const Small: Story = {
  args: { size: 'sm' },
}

export const Medium: Story = {
  args: { size: 'md' },
}

export const Large: Story = {
  args: { size: 'lg' },
}

export const FromCompactFormContext: Story = {
  name: 'Default from compact form context',
  render: (args) => (
    <FormSectionProvider density="compact">
      <NumberStepperHarness {...args} />
    </FormSectionProvider>
  ),
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
