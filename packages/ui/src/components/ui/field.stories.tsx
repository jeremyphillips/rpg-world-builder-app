import type { Meta, StoryObj } from '@storybook/react-vite'

import { Field } from './field.client'
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
      <Field.Label>Character name</Field.Label>
      <Field.Control>
        <Input placeholder="Tasha" />
      </Field.Control>
      <Field.Hint />
      <Field.Error />
    </Field.Root>
  ),
}

export const WithHint: Story = {
  render: () => (
    <Field.Root id="name" hint="Shown to other players.">
      <Field.Label>Character name</Field.Label>
      <Field.Control>
        <Input placeholder="Tasha" />
      </Field.Control>
      <Field.Hint />
      <Field.Error />
    </Field.Root>
  ),
}

export const Required: Story = {
  render: () => (
    <Field.Root id="name" required>
      <Field.Label>Character name</Field.Label>
      <Field.Control>
        <Input placeholder="Tasha" />
      </Field.Control>
      <Field.Hint />
      <Field.Error />
    </Field.Root>
  ),
}

export const WithError: Story = {
  render: () => (
    <Field.Root id="name" hint="Shown to other players." error="Name is required.">
      <Field.Label>Character name</Field.Label>
      <Field.Control>
        <Input defaultValue="" />
      </Field.Control>
      <Field.Hint />
      <Field.Error />
    </Field.Root>
  ),
}

export const WithInfo: Story = {
  render: () => (
    <Field.Root id="alignment">
      <Field.Label>
        Alignment
        <InfoTooltip aria-label="About alignment">
          A shorthand for your character&apos;s moral compass.
        </InfoTooltip>
      </Field.Label>
      <Field.Control>
        <Input placeholder="True Neutral" />
      </Field.Control>
      <Field.Hint />
      <Field.Error />
    </Field.Root>
  ),
}
