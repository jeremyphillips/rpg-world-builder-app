import type { Meta, StoryObj } from '@storybook/react-vite'

import { ClassReferenceTable } from '../../stories/semantic-classes/class-reference-table'
import { semanticClassSelectArgType } from '../../stories/semantic-classes/semantic-class-arg-types.lib'
import { Input } from './input.client'
import { fieldControlVariants } from './field-control.variants'
import { FIELD_CONTROL_SIZE_SPECS, UI_FIELD_CONTROL_BLOCK_CLASS } from './field-control.styles'

const meta = {
  title: 'Primitives/Input',
  component: Input,
  parameters: {
    semanticClasses: true,
    docs: {
      description: {
        component: `${UI_FIELD_CONTROL_BLOCK_CLASS} owns single-line field chrome in CSS; size modifiers set geometry.`,
      },
    },
  },
  args: {
    placeholder: 'you@example.com',
    'aria-label': 'Email',
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      ...semanticClassSelectArgType(
        FIELD_CONTROL_SIZE_SPECS.map((spec) => ({
          value: spec.size,
          className: spec.className,
        })),
        'size',
      ),
    },
  },
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Email: Story = {
  args: { type: 'email', placeholder: 'you@example.com', 'aria-label': 'Email' },
}

export const Password: Story = {
  args: { type: 'password', placeholder: '••••••••', 'aria-label': 'Password' },
}

export const Disabled: Story = {
  args: { disabled: true, value: 'Disabled', 'aria-label': 'Disabled field' },
}

export const DisabledPlaceholder: Story = {
  args: {
    disabled: true,
    value: '',
    placeholder: 'Choose a relationship first',
    'aria-label': 'Relationship',
  },
}

export const ClassReference: Story = {
  tags: ['control-parity'],
  parameters: { semanticClasses: true },
  render: () => (
    <ClassReferenceTable
      rows={FIELD_CONTROL_SIZE_SPECS.map((spec) => ({
        key: spec.size,
        sample: (
          <Input
            size={spec.size}
            aria-label={`${spec.size} input`}
            placeholder="Sample"
            data-semantic-class-target
          />
        ),
        propsLabel: `size="${spec.size}"`,
        className: fieldControlVariants({ size: spec.size }),
        keyValues: `control height: ${spec.controlHeight}`,
        useCase: spec.useCase,
      }))}
    />
  ),
}
