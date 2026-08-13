import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState, type ComponentProps } from 'react'

import { DisclosureChoiceComposer } from './disclosure-choice-composer.client'

const meta = {
  title: 'Create Flow/DisclosureChoiceComposer',
  component: DisclosureChoiceComposer,
  parameters: { layout: 'padded' },
  args: {
    id: 'relationship',
    confirmLabel: 'Add relationship',
    value: null,
    onValueChange: () => undefined,
  },
} satisfies Meta<typeof DisclosureChoiceComposer>

export default meta
type Story = StoryObj<typeof meta>

const choices = [
  { value: 'owns', label: 'Owner' },
  { value: 'tenant', label: 'Tenant' },
  { value: 'operator', label: 'Operator' },
  { value: 'headquarters', label: 'Headquarters' },
]

function ControlledComposer(
  props: Omit<ComponentProps<typeof DisclosureChoiceComposer>, 'value' | 'onValueChange'>,
) {
  const [value, setValue] = useState<string | null>(null)
  return <DisclosureChoiceComposer {...props} value={value} onValueChange={setValue} />
}

export const MultipleChoices: Story = {
  args: { choices },
  render: (args) => <ControlledComposer {...args} />,
}

export const SingleEligibleChoice: Story = {
  args: {
    choices: [
      { value: 'owns', label: 'Owner', disabled: true, disabledReason: 'Already used' },
      { value: 'operator', label: 'Operator' },
    ],
  },
  render: (args) => <ControlledComposer {...args} />,
}

export const DisabledChoices: Story = {
  args: {
    choices: [
      { value: 'owns', label: 'Owner' },
      {
        value: 'headquarters',
        label: 'Headquarters',
        disabled: true,
        disabledReason: 'Headquarters conflicts with another relationship.',
      },
    ],
    value: 'owns',
  },
}
