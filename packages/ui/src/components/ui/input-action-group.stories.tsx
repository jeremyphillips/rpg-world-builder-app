import type { Meta, StoryObj } from '@storybook/react-vite'

import { ClassReferenceTable } from '../../stories/semantic-classes/class-reference-table'
import { Button } from './button.client'
import { Input } from './input.client'
import { InputActionGroup } from './input-action-group.client'
import type { FieldSize } from './field.client'
import { FIELD_GROUP_SIZE_SPECS, UI_FIELD_GROUP_BLOCK_CLASS } from './field-group.styles'

const meta = {
  title: 'Primitives/InputActionGroup',
  component: InputActionGroup,
  parameters: {
    layout: 'centered',
    semanticClasses: true,
    docs: {
      description: {
        component: `${UI_FIELD_GROUP_BLOCK_CLASS} stretch layout; attached buttons read --ui-field-action-px from the shell size modifier.`,
      },
    },
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

export const ClassReference: Story = {
  tags: ['control-parity'],
  parameters: { semanticClasses: true },
  render: () => (
    <ClassReferenceTable
      rows={FIELD_GROUP_SIZE_SPECS.map((spec) => ({
        key: spec.size,
        sample: (
          <div className="w-80">
            <InputActionGroup size={spec.size}>
              <Input grouped size={spec.size} aria-label="Sample" placeholder="Sample" />
              <InputActionGroup.Action>
                <Button type="button" variant="attached">
                  Action
                </Button>
              </InputActionGroup.Action>
            </InputActionGroup>
          </div>
        ),
        propsLabel: `size="${spec.size}"`,
        className: spec.className,
        notes: spec.useCase,
      }))}
    />
  ),
}
