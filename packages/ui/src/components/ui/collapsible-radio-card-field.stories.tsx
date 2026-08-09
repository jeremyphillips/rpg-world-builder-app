import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import { CollapsibleRadioCardField } from './collapsible-radio-card-field'

const options = [
  {
    label: 'Governs',
    value: 'governs',
    description: 'Exercises political or administrative authority over this region.',
  },
  {
    label: 'Controls',
    value: 'controls',
    description: 'Exercises military or coercive control over this region.',
  },
  {
    label: 'Claims',
    value: 'claims',
    description: 'Publicly asserts authority without fully exercising it.',
  },
]

const meta = {
  title: 'Forms/CollapsibleRadioCardField',
  component: CollapsibleRadioCardField,
  args: {
    id: 'connection-kind',
    label: 'Authority type',
    summaryEyebrow: 'Authority type',
    changeLabel: 'Change connection type',
    density: 'compact',
    options,
  },
} satisfies Meta<typeof CollapsibleRadioCardField>

export default meta
type Story = StoryObj<typeof meta>

export const Expanded: Story = {
  render: (args) => {
    const [value, setValue] = useState('')

    return (
      <CollapsibleRadioCardField {...args} value={value} onValueChange={setValue} defaultExpanded />
    )
  },
}

export const CollapsedWithSelection: Story = {
  render: (args) => {
    const [value, setValue] = useState('governs')

    return (
      <CollapsibleRadioCardField
        {...args}
        value={value}
        onValueChange={setValue}
        defaultExpanded={false}
      />
    )
  },
}

export const Interactive: Story = {
  render: (args) => {
    const [value, setValue] = useState('')

    return <CollapsibleRadioCardField {...args} value={value} onValueChange={setValue} />
  },
}

export const CompactSummaryWithoutDescription: Story = {
  render: (args) => {
    const [value, setValue] = useState('governs')

    return (
      <CollapsibleRadioCardField
        {...args}
        value={value}
        onValueChange={setValue}
        summaryDescription={false}
        defaultExpanded={false}
      />
    )
  },
}

export const ControlledWithoutCollapseAfterSelect: Story = {
  render: (args) => {
    const [value, setValue] = useState('')
    const [expanded, setExpanded] = useState(true)

    return (
      <CollapsibleRadioCardField
        {...args}
        value={value}
        onValueChange={setValue}
        collapseAfterSelect={false}
        expanded={expanded}
        onExpandedChange={setExpanded}
      />
    )
  },
}
