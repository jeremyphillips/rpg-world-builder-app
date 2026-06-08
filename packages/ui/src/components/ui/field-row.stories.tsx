import type { Meta, StoryObj } from '@storybook/react-vite'

import { FieldRow } from './field-row'
import { TextField } from './text-field'
import { NumberField } from './number-field'
import { SelectField } from './select-field'

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
