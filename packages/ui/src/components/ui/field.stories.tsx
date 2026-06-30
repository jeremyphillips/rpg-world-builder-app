import type { Meta, StoryObj } from '@storybook/react-vite'

import { Field } from './field.client'
import { FieldLayout } from './field-layout'
import { Input } from './input.client'
import { InfoTooltip } from './tooltip.client'

const meta = {
  title: 'Forms/Field',
  component: Field.Root,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Field.Root>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Field.Root id="name">
      <FieldLayout
        label={<Field.Label>Character name</Field.Label>}
        control={<Input placeholder="Tasha" />}
      />
    </Field.Root>
  ),
}

export const WithHint: Story = {
  render: () => (
    <Field.Root id="name" hint="Shown to other players.">
      <FieldLayout
        label={<Field.Label>Character name</Field.Label>}
        control={<Input placeholder="Tasha" />}
      />
    </Field.Root>
  ),
}

export const HintBelowControl: Story = {
  render: () => (
    <Field.Root id="name" hint="Legacy placement under the control.">
      <FieldLayout
        hintPosition="below-control"
        label={<Field.Label>Character name</Field.Label>}
        control={<Input placeholder="Tasha" />}
      />
    </Field.Root>
  ),
}

export const Required: Story = {
  render: () => (
    <Field.Root id="name" required>
      <FieldLayout
        label={<Field.Label>Character name</Field.Label>}
        control={<Input placeholder="Tasha" />}
      />
    </Field.Root>
  ),
}

export const WithError: Story = {
  render: () => (
    <Field.Root id="name" hint="Shown to other players." error="Name is required.">
      <FieldLayout
        label={<Field.Label>Character name</Field.Label>}
        control={<Input defaultValue="" />}
      />
    </Field.Root>
  ),
}

export const WithInfo: Story = {
  render: () => (
    <Field.Root id="alignment">
      <FieldLayout
        label={
          <Field.Label>
            Alignment
            <InfoTooltip aria-label="About alignment">
              A shorthand for your character&apos;s moral compass.
            </InfoTooltip>
          </Field.Label>
        }
        control={<Input placeholder="Neutral" />}
      />
    </Field.Root>
  ),
}
