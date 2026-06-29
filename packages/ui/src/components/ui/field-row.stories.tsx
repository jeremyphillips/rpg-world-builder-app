'use client'

import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'

import { FieldRow } from './field-row'
import { TextField } from './text-field'
import { NumberField } from './number-field'
import { SelectField } from './select-field'
import { InputSelectField } from './input-select-field.client'
import { SwitchField } from './switch-field'

const durationKindOptions = [
  { label: 'Instantaneous', value: 'instantaneous' },
  { label: 'Timed', value: 'timed' },
  { label: 'Special', value: 'special' },
]

const durationUnitOptions = [
  { label: 'Round', value: 'round' },
  { label: 'Minute', value: 'minute' },
  { label: 'Hour', value: 'hour' },
  { label: 'Day', value: 'day' },
]

function DurationRowHarness() {
  const [value, setValue] = React.useState<number | undefined>(1)
  const [unit, setUnit] = React.useState('minute')

  return (
    <FieldRow>
      <SelectField
        id="kind"
        label="Duration kind"
        width="lg"
        required
        defaultValue="timed"
        options={durationKindOptions}
      />
      <InputSelectField
        id="duration"
        label="Duration"
        inputType="number"
        width="auto"
        required
        valueDigits={2}
        min={1}
        value={value}
        unit={unit}
        options={durationUnitOptions}
        onValueChange={(next) => setValue(typeof next === 'number' ? next : undefined)}
        onUnitChange={setUnit}
      />
      <SwitchField id="up-to" label="Up to" labelPosition="above" width="auto" />
    </FieldRow>
  )
}

const meta = {
  title: 'Forms/Layout/FieldRow',
  component: FieldRow,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof FieldRow>

export default meta
type Story = StoryObj<typeof meta>

/** Two fields with no width split the row 50/50 by default. */
export const EvenSplit: Story = {
  args: {
    children: (
      <>
        <TextField id="first" label="First name" />
        <TextField id="last" label="Last name" />
      </>
    ),
  },
}

/** A fixed-width field keeps its size while the full-width field fills the rest. */
export const FixedPlusFull: Story = {
  args: {
    children: (
      <>
        <NumberField id="count" label="Count" width="xs" defaultValue={1} />
        <SelectField
          id="die"
          label="Die face"
          width="full"
          placeholder="Choose"
          options={[
            { label: 'd6', value: '6' },
            { label: 'd20', value: '20' },
          ]}
        />
      </>
    ),
  },
}

/** Select + inputSelect + switch — label baselines should align (spell Duration row). */
export const LabeledRowWithInputSelect: Story = {
  render: () => <DurationRowHarness />,
}
