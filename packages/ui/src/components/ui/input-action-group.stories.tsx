import type { Meta, StoryObj } from '@storybook/react-vite'

import { Button } from './button.client'
import { Input } from './input.client'
import { InputActionGroup } from './input-action-group.client'
import type { FieldSize } from './field.client'

const meta = {
  title: 'Primitives/InputActionGroup',
  component: InputActionGroup,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof InputActionGroup>

export default meta
type Story = StoryObj<typeof meta>

function AttachedActionExample({
  size = 'md',
  disabled,
  actionDisabled,
  pending,
  invalid,
  placeholder = 'Enter a name',
}: {
  size?: FieldSize
  disabled?: boolean
  actionDisabled?: boolean
  pending?: boolean
  invalid?: boolean
  placeholder?: string
}) {
  const label = `Name (${size})`
  const inputId = `name-${size}`

  return (
    <div className="w-80">
      <label className="mb-2 block text-sm font-medium" htmlFor={inputId}>
        {label}
      </label>
      <InputActionGroup size={size} disabled={disabled} invalid={invalid}>
        <Input grouped id={inputId} size={size} placeholder={placeholder} disabled={disabled} />
        <InputActionGroup.Action disabled={actionDisabled || pending}>
          <Button type="button" variant="attached" disabled={pending}>
            {pending ? 'Generating…' : 'Generate'}
          </Button>
        </InputActionGroup.Action>
      </InputActionGroup>
    </div>
  )
}

/** Default attached actions at each field size — hover and Tab focus the full segment surface. */
export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      <AttachedActionExample size="sm" />
      <AttachedActionExample size="md" />
      <AttachedActionExample size="lg" />
    </div>
  ),
}

export const States: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      <AttachedActionExample size="md" placeholder="Default" />
      <AttachedActionExample size="md" disabled placeholder="Group disabled" />
      <AttachedActionExample size="md" actionDisabled placeholder="Action disabled" />
      <AttachedActionExample size="md" pending placeholder="Action pending" />
      <AttachedActionExample size="md" invalid placeholder="Invalid group" />
    </div>
  ),
}

export const NameGenerate: Story = {
  render: () => <AttachedActionExample size="md" />,
}
